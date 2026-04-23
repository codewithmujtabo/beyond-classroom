import { Router, Request, Response } from "express";
import { pool } from "../config/database";
import { authMiddleware } from "../middleware/auth";
import crypto from "crypto";
import { sendParentInvitationEmail } from "../services/email.service";

const router = Router();

// ── POST /api/parents/invite-parent ──────────────────────────────────────
// Student sends invitation to parent email
router.post("/invite-parent", authMiddleware, async (req: Request, res: Response) => {
  try {
    const studentId = req.userId!;
    const { parentEmail } = req.body;

    if (!parentEmail || !parentEmail.includes("@")) {
      res.status(400).json({ message: "Valid parent email is required" });
      return;
    }

    // Verify the requester is a student
    const studentCheck = await pool.query(
      "SELECT full_name FROM users WHERE id = $1 AND role = 'student'",
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      res.status(403).json({ message: "Only students can send parent invitations" });
      return;
    }

    const studentName = studentCheck.rows[0].full_name;

    // Check for existing pending invitation to same email from same student (within last 24h)
    const existingInvite = await pool.query(
      `SELECT id FROM invitations
       WHERE student_id = $1 AND parent_email = $2
       AND status = 'pending' AND expires_at > now()`,
      [studentId, parentEmail.toLowerCase()]
    );

    if (existingInvite.rows.length > 0) {
      res.status(409).json({ message: "An invitation to this email is already pending" });
      return;
    }

    // Generate 6-digit PIN
    const pin = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create invitation
    const result = await pool.query(
      `INSERT INTO invitations (student_id, parent_email, verification_pin, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [studentId, parentEmail.toLowerCase(), pin, expiresAt]
    );

    // Send email with PIN
    await sendParentInvitationEmail(parentEmail, pin, studentName);

    res.status(201).json({
      invitationId: result.rows[0].id,
      message: "Invitation sent successfully"
    });
  } catch (err) {
    console.error("Invite parent error:", err);
    res.status(500).json({ message: "Failed to send invitation" });
  }
});

// ── POST /api/parents/accept-invitation ──────────────────────────────────
// Parent accepts invitation using PIN
router.post("/accept-invitation", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parentId = req.userId!;
    const { email, pin } = req.body;

    if (!email || !pin) {
      res.status(400).json({ message: "Email and PIN are required" });
      return;
    }

    // Verify the requester is a parent
    const parentCheck = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'parent'",
      [parentId]
    );

    if (parentCheck.rows.length === 0) {
      res.status(403).json({ message: "Only parent accounts can accept invitations" });
      return;
    }

    // Find valid invitation
    const inviteResult = await pool.query(
      `SELECT id, student_id FROM invitations
       WHERE parent_email = $1 AND verification_pin = $2
       AND status = 'pending' AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase(), pin]
    );

    if (inviteResult.rows.length === 0) {
      res.status(400).json({ message: "Invalid or expired PIN" });
      return;
    }

    const invitation = inviteResult.rows[0];

    // Check if link already exists
    const existingLink = await pool.query(
      `SELECT id, status FROM parent_student_links
       WHERE parent_id = $1 AND student_id = $2`,
      [parentId, invitation.student_id]
    );

    if (existingLink.rows.length > 0) {
      res.status(409).json({
        message: "Link already exists",
        status: existingLink.rows[0].status
      });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Mark invitation as accepted
      await client.query(
        "UPDATE invitations SET status = 'accepted', accepted_at = now() WHERE id = $1",
        [invitation.id]
      );

      // Create parent-student link with pending status (requires student approval)
      const linkResult = await client.query(
        `INSERT INTO parent_student_links (parent_id, student_id, status)
         VALUES ($1, $2, 'pending')
         RETURNING id`,
        [parentId, invitation.student_id]
      );

      await client.query("COMMIT");

      res.status(201).json({
        linkId: linkResult.rows[0].id,
        status: "pending",
        message: "Link created. Waiting for student approval."
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Accept invitation error:", err);
    res.status(500).json({ message: "Failed to accept invitation" });
  }
});

// ── GET /api/parents/my-children ─────────────────────────────────────────
// Parent views linked children
router.get("/my-children", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parentId = req.userId!;
    const { status } = req.query;

    let query = `
      SELECT
        psl.id as link_id,
        psl.status as link_status,
        psl.created_at as linked_at,
        u.id as student_id,
        u.full_name,
        u.email,
        u.phone,
        s.school_name,
        s.grade,
        s.nisn
      FROM parent_student_links psl
      JOIN users u ON psl.student_id = u.id
      LEFT JOIN students s ON u.id = s.id
      WHERE psl.parent_id = $1
    `;

    const params: any[] = [parentId];

    if (status) {
      query += " AND psl.status = $2";
      params.push(status);
    }

    query += " ORDER BY psl.created_at DESC";

    const result = await pool.query(query, params);

    // For each student, fetch their registrations
    const children = await Promise.all(result.rows.map(async (row) => {
      const regsResult = await pool.query(
        `SELECT
          r.id as registration_id,
          r.status as reg_status,
          r.registered_at,
          c.id as competition_id,
          c.name as competition_name,
          c.category,
          c.level,
          c.reg_close_date
        FROM registrations r
        JOIN competitions c ON r.comp_id = c.id
        WHERE r.user_id = $1
        ORDER BY r.registered_at DESC`,
        [row.student_id]
      );

      return {
        linkId: row.link_id,
        linkStatus: row.link_status,
        linkedAt: row.linked_at,
        studentId: row.student_id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        school: row.school_name,
        grade: row.grade,
        nisn: row.nisn,
        registrations: regsResult.rows.map(reg => ({
          registrationId: reg.registration_id,
          competitionId: reg.competition_id,
          competitionName: reg.competition_name,
          category: reg.category,
          level: reg.level,
          status: reg.reg_status,
          registeredAt: reg.registered_at,
          regCloseDate: reg.reg_close_date
        }))
      };
    }));

    res.json(children);
  } catch (err) {
    console.error("Get my children error:", err);
    res.status(500).json({ message: "Failed to fetch children" });
  }
});

// ── GET /api/parents/pending-invitations ─────────────────────────────────
// Student views pending parent link approvals
router.get("/pending-invitations", authMiddleware, async (req: Request, res: Response) => {
  try {
    const studentId = req.userId!;

    const result = await pool.query(
      `SELECT
        psl.id as link_id,
        psl.created_at,
        u.id as parent_id,
        u.full_name as parent_name,
        u.email as parent_email
      FROM parent_student_links psl
      JOIN users u ON psl.parent_id = u.id
      WHERE psl.student_id = $1 AND psl.status = 'pending'
      ORDER BY psl.created_at DESC`,
      [studentId]
    );

    res.json(result.rows.map(row => ({
      linkId: row.link_id,
      parentId: row.parent_id,
      parentName: row.parent_name,
      parentEmail: row.parent_email,
      createdAt: row.created_at
    })));
  } catch (err) {
    console.error("Get pending invitations error:", err);
    res.status(500).json({ message: "Failed to fetch pending invitations" });
  }
});

// ── PUT /api/parents/links/:linkId/approve ───────────────────────────────
// Student approves or rejects parent link
router.put("/links/:linkId/approve", authMiddleware, async (req: Request, res: Response) => {
  try {
    const studentId = req.userId!;
    const { linkId } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'rejected'].includes(status)) {
      res.status(400).json({ message: "Status must be 'active' or 'rejected'" });
      return;
    }

    // Verify the link belongs to this student and is pending
    const linkCheck = await pool.query(
      `SELECT id FROM parent_student_links
       WHERE id = $1 AND student_id = $2 AND status = 'pending'`,
      [linkId, studentId]
    );

    if (linkCheck.rows.length === 0) {
      res.status(404).json({ message: "Link not found or already processed" });
      return;
    }

    // Update link status
    const updateResult = await pool.query(
      `UPDATE parent_student_links
       SET status = $1, approved_at = now()
       WHERE id = $2
       RETURNING *`,
      [status, linkId]
    );

    res.json({
      linkId: updateResult.rows[0].id,
      status: updateResult.rows[0].status,
      approvedAt: updateResult.rows[0].approved_at,
      message: status === 'active' ? 'Parent link approved' : 'Parent link rejected'
    });
  } catch (err) {
    console.error("Approve link error:", err);
    res.status(500).json({ message: "Failed to update link status" });
  }
});

export default router;

import { Router } from "express";
import { pool } from "../config/database";
import { adminOnly } from "../middleware/admin.middleware";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

/**
 * GET /api/admin/competitions
 * Get all competitions with round counts
 */
router.get("/competitions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.*,
        COUNT(cr.id) as actual_round_count
      FROM competitions c
      LEFT JOIN competition_rounds cr ON c.id = cr.comp_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({ message: "Failed to fetch competitions" });
  }
});

/**
 * POST /api/admin/competitions
 * Create a new competition with rounds
 */
router.post("/competitions", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      organizerName,
      category,
      gradeLevel,
      websiteUrl,
      registrationStatus,
      posterUrl,
      isInternational,
      detailedDescription,
      description,
      fee,
      quota,
      regOpenDate,
      regCloseDate,
      competitionDate,
      requiredDocs,
      imageUrl,
      rounds,
    } = req.body;

    // Generate competition ID
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\\s-]/g, "")
      .replace(/\\s+/g, "-")
      .substring(0, 40);

    const timestamp = Date.now();
    const compId = `comp-${timestamp}-${slug}`;

    // Insert competition
    const compResult = await client.query(
      `INSERT INTO competitions (
        id, name, organizer_name, category, grade_level,
        website_url, registration_status, poster_url, is_international,
        detailed_description, description, fee, quota,
        reg_open_date, reg_close_date, competition_date,
        required_docs, image_url, round_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        compId,
        name,
        organizerName,
        category,
        gradeLevel,
        websiteUrl,
        registrationStatus || "Coming Soon",
        posterUrl,
        isInternational || false,
        detailedDescription,
        description,
        fee || 0,
        quota,
        regOpenDate,
        regCloseDate,
        competitionDate,
        requiredDocs || [],
        imageUrl,
        rounds?.length || 0,
      ]
    );

    // Insert rounds if provided
    if (rounds && rounds.length > 0) {
      for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        await client.query(
          `INSERT INTO competition_rounds (
            comp_id, round_name, round_type, start_date,
            registration_deadline, exam_date, results_date,
            fee, location, round_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            compId,
            round.roundName,
            round.roundType,
            round.startDate,
            round.registrationDeadline,
            round.examDate,
            round.resultsDate,
            round.fee || 0,
            round.location,
            i + 1,
          ]
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Competition created successfully",
      competition: compResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating competition:", error);
    res.status(500).json({ message: "Failed to create competition" });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/admin/competitions/:id
 * Update an existing competition
 */
router.put("/competitions/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const {
      name,
      organizerName,
      category,
      gradeLevel,
      websiteUrl,
      registrationStatus,
      posterUrl,
      isInternational,
      detailedDescription,
      description,
      fee,
      quota,
      regOpenDate,
      regCloseDate,
      competitionDate,
      requiredDocs,
      imageUrl,
      rounds,
    } = req.body;

    // Update competition
    const compResult = await client.query(
      `UPDATE competitions SET
        name = $1,
        organizer_name = $2,
        category = $3,
        grade_level = $4,
        website_url = $5,
        registration_status = $6,
        poster_url = $7,
        is_international = $8,
        detailed_description = $9,
        description = $10,
        fee = $11,
        quota = $12,
        reg_open_date = $13,
        reg_close_date = $14,
        competition_date = $15,
        required_docs = $16,
        image_url = $17,
        round_count = $18
      WHERE id = $19
      RETURNING *`,
      [
        name,
        organizerName,
        category,
        gradeLevel,
        websiteUrl,
        registrationStatus,
        posterUrl,
        isInternational,
        detailedDescription,
        description,
        fee,
        quota,
        regOpenDate,
        regCloseDate,
        competitionDate,
        requiredDocs || [],
        imageUrl,
        rounds?.length || 0,
        id,
      ]
    );

    if (compResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Competition not found" });
    }

    // Delete existing rounds
    await client.query("DELETE FROM competition_rounds WHERE comp_id = $1", [id]);

    // Insert new rounds
    if (rounds && rounds.length > 0) {
      for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        await client.query(
          `INSERT INTO competition_rounds (
            comp_id, round_name, round_type, start_date,
            registration_deadline, exam_date, results_date,
            fee, location, round_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            id,
            round.roundName,
            round.roundType,
            round.startDate,
            round.registrationDeadline,
            round.examDate,
            round.resultsDate,
            round.fee || 0,
            round.location,
            i + 1,
          ]
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      message: "Competition updated successfully",
      competition: compResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating competition:", error);
    res.status(500).json({ message: "Failed to update competition" });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/admin/competitions/:id
 * Delete a competition
 */
router.delete("/competitions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if competition has registrations
    const regCheck = await pool.query(
      "SELECT COUNT(*) FROM registrations WHERE comp_id = $1",
      [id]
    );

    if (parseInt(regCheck.rows[0].count) > 0) {
      return res.status(400).json({
        message: "Cannot delete competition with existing registrations",
      });
    }

    // Delete competition (rounds will be deleted via CASCADE)
    const result = await pool.query(
      "DELETE FROM competitions WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Competition not found" });
    }

    res.json({ message: "Competition deleted successfully" });
  } catch (error) {
    console.error("Error deleting competition:", error);
    res.status(500).json({ message: "Failed to delete competition" });
  }
});

/**
 * GET /api/admin/competitions/:id/registrations
 * Get all registrations for a competition with student details
 */
router.get("/competitions/:id/registrations", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        r.*,
        u.full_name,
        u.email,
        u.phone,
        s.nisn,
        s.school_name,
        s.grade,
        s.date_of_birth,
        s.address,
        s.parent_phone,
        s.parent_school_id
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN students s ON u.id = s.user_id
      WHERE r.comp_id = $1
      ORDER BY r.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

/**
 * GET /api/admin/competitions/:id/registrations/export
 * Export registrations as CSV
 */
router.get("/competitions/:id/registrations/export", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        r.id as registration_id,
        r.status,
        r.created_at as registration_date,
        u.full_name,
        u.email,
        u.phone,
        s.nisn,
        s.school_name,
        s.grade,
        s.date_of_birth,
        s.address,
        s.parent_phone
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN students s ON u.id = s.user_id
      WHERE r.comp_id = $1
      ORDER BY r.created_at DESC`,
      [id]
    );

    // Generate CSV
    const headers = [
      "Registration ID",
      "Status",
      "Registration Date",
      "Full Name",
      "Email",
      "Phone",
      "NISN",
      "School",
      "Grade",
      "Date of Birth",
      "Address",
      "Parent Phone",
    ];

    const csvRows = [headers.join(",")];

    for (const row of result.rows) {
      const values = [
        row.registration_id,
        row.status,
        new Date(row.registration_date).toLocaleDateString("id-ID"),
        `"${row.full_name || ""}"`,
        row.email || "",
        row.phone || "",
        row.nisn || "",
        `"${row.school_name || ""}"`,
        row.grade || "",
        row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString("id-ID") : "",
        `"${row.address || ""}"`,
        row.parent_phone || "",
      ];
      csvRows.push(values.join(","));
    }

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=registrations-${id}-${Date.now()}.csv`
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting registrations:", error);
    res.status(500).json({ message: "Failed to export registrations" });
  }
});

/**
 * GET /api/admin/stats
 * Get platform statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const [competitions, users, registrations, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM competitions"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'"),
      pool.query("SELECT COUNT(*) FROM registrations"),
      pool.query("SELECT SUM(c.fee) FROM registrations r JOIN competitions c ON r.comp_id = c.id WHERE r.status = 'paid'"),
    ]);

    res.json({
      totalCompetitions: parseInt(competitions.rows[0].count),
      totalStudents: parseInt(users.rows[0].count),
      totalRegistrations: parseInt(registrations.rows[0].count),
      totalRevenue: parseInt(revenue.rows[0].sum) || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

export default router;

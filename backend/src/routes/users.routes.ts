import { Router, Request, Response } from "express";
import { pool } from "../config/database";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All routes require auth
router.use(authMiddleware);

// ── GET /api/users/me ─────────────────────────────────────────────────────
router.get("/me", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = result.rows[0];

    // Fetch role-specific data
    let roleData = {};
    if (user.role === "student") {
      const r = await pool.query("SELECT * FROM students WHERE id = $1", [req.userId]);
      if (r.rows.length > 0) {
        roleData = { school: r.rows[0].school, grade: r.rows[0].grade, nisn: r.rows[0].nisn };
      }
    } else if (user.role === "parent") {
      const r = await pool.query("SELECT * FROM parents WHERE id = $1", [req.userId]);
      if (r.rows.length > 0) {
        roleData = {
          childName: r.rows[0].child_name,
          childSchool: r.rows[0].child_school,
          childGrade: r.rows[0].child_grade,
          relationship: r.rows[0].relationship,
        };
      }
    } else if (user.role === "teacher") {
      const r = await pool.query("SELECT * FROM teachers WHERE id = $1", [req.userId]);
      if (r.rows.length > 0) {
        roleData = { school: r.rows[0].school, subject: r.rows[0].subject, department: r.rows[0].department };
      }
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      city: user.city,
      role: user.role,
      photoUrl: user.photo_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      ...roleData,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ── PUT /api/users/me ─────────────────────────────────────────────────────
router.put("/me", async (req: Request, res: Response) => {
  try {
    const { fullName, phone, city, photoUrl, nisn, school, grade, subject } = req.body;

    // Update users table
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (fullName !== undefined) { fields.push(`full_name = $${idx++}`); values.push(fullName); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
    if (city !== undefined) { fields.push(`city = $${idx++}`); values.push(city); }
    if (photoUrl !== undefined) { fields.push(`photo_url = $${idx++}`); values.push(photoUrl); }

    if (fields.length > 0) {
      fields.push(`updated_at = now()`);
      values.push(req.userId);
      await pool.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}`,
        values
      );
    }

    // Update role-specific table
    const userResult = await pool.query("SELECT role FROM users WHERE id = $1", [req.userId]);
    if (userResult.rows.length > 0) {
      const role = userResult.rows[0].role;

      if (role === "student") {
        const sFields: string[] = [];
        const sValues: any[] = [];
        let sIdx = 1;
        if (school !== undefined) { sFields.push(`school = $${sIdx++}`); sValues.push(school); }
        if (grade !== undefined) { sFields.push(`grade = $${sIdx++}`); sValues.push(grade); }
        if (nisn !== undefined) { sFields.push(`nisn = $${sIdx++}`); sValues.push(nisn); }
        if (sFields.length > 0) {
          sFields.push(`updated_at = now()`);
          sValues.push(req.userId);
          await pool.query(`UPDATE students SET ${sFields.join(", ")} WHERE id = $${sIdx}`, sValues);
        }
      } else if (role === "teacher" && subject !== undefined) {
        await pool.query("UPDATE teachers SET subject = $1, updated_at = now() WHERE id = $2", [subject, req.userId]);
      }
    }

    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;

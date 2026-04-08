import { Router, Request, Response } from "express";
import { pool } from "../config/database";

const router = Router();

// ── GET /api/competitions ─────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, grade } = req.query;

    let query = "SELECT * FROM competitions";
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (category) {
      conditions.push(`category = $${idx++}`);
      values.push(category);
    }
    if (grade) {
      conditions.push(`grade_level LIKE $${idx++}`);
      values.push(`%${grade}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);

    const competitions = result.rows.map((c) => ({
      id: c.id,
      name: c.name,
      organizerName: c.organizer_name,
      category: c.category,
      gradeLevel: c.grade_level,
      fee: c.fee,
      quota: c.quota,
      regOpenDate: c.reg_open_date,
      regCloseDate: c.reg_close_date,
      competitionDate: c.competition_date,
      requiredDocs: c.required_docs,
      description: c.description,
      imageUrl: c.image_url,
      createdAt: c.created_at,
    }));

    res.json(competitions);
  } catch (err) {
    console.error("List competitions error:", err);
    res.status(500).json({ message: "Failed to fetch competitions" });
  }
});

// ── GET /api/competitions/:id ─────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM competitions WHERE id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Competition not found" });
      return;
    }

    const c = result.rows[0];
    res.json({
      id: c.id,
      name: c.name,
      organizerName: c.organizer_name,
      category: c.category,
      gradeLevel: c.grade_level,
      fee: c.fee,
      quota: c.quota,
      regOpenDate: c.reg_open_date,
      regCloseDate: c.reg_close_date,
      competitionDate: c.competition_date,
      requiredDocs: c.required_docs,
      description: c.description,
      imageUrl: c.image_url,
      createdAt: c.created_at,
    });
  } catch (err) {
    console.error("Get competition error:", err);
    res.status(500).json({ message: "Failed to fetch competition" });
  }
});

export default router;

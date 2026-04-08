import { Router, Request, Response } from "express";
import { pool } from "../config/database";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// ── GET /api/registrations ────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM registrations WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );

    const registrations = result.rows.map((r) => ({
      id: r.id,
      compId: r.comp_id,
      status: r.status,
      meta: r.meta,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json(registrations);
  } catch (err) {
    console.error("List registrations error:", err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

// ── POST /api/registrations ───────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const { id, compId, status, meta } = req.body;

    if (!id || !compId) {
      res.status(400).json({ message: "id and compId are required" });
      return;
    }

    await pool.query(
      `INSERT INTO registrations (id, user_id, comp_id, status, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, req.userId, compId, status || "registered", meta ? JSON.stringify(meta) : null]
    );

    res.status(201).json({ message: "Registration created", id });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ message: "Registration already exists" });
      return;
    }
    console.error("Create registration error:", err);
    res.status(500).json({ message: "Failed to create registration" });
  }
});

// ── PUT /api/registrations/:id ────────────────────────────────────────────
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE registrations SET status = $1, updated_at = now()
       WHERE id = $2 AND user_id = $3
       RETURNING id`,
      [status, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Registration not found" });
      return;
    }

    res.json({ message: "Registration updated" });
  } catch (err) {
    console.error("Update registration error:", err);
    res.status(500).json({ message: "Failed to update registration" });
  }
});

// ── DELETE /api/registrations/:id ─────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "DELETE FROM registrations WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Registration not found" });
      return;
    }

    res.json({ message: "Registration deleted" });
  } catch (err) {
    console.error("Delete registration error:", err);
    res.status(500).json({ message: "Failed to delete registration" });
  }
});

export default router;

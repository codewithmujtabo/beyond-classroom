import { Router, Request, Response } from "express";
import { pool } from "../config/database";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// ── GET /api/documents ────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC",
      [req.userId]
    );

    const documents = result.rows.map((d) => ({
      id: d.id,
      docType: d.doc_type,
      fileName: d.file_name,
      fileSize: d.file_size,
      fileUrl: d.file_url,
      uploadedAt: d.uploaded_at,
    }));

    res.json(documents);
  } catch (err) {
    console.error("List documents error:", err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});

// ── POST /api/documents ───────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const { docType, fileName, fileSize, fileUrl } = req.body;

    if (!docType || !fileUrl) {
      res.status(400).json({ message: "docType and fileUrl are required" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO documents (user_id, doc_type, file_name, file_size, file_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [req.userId, docType, fileName || null, fileSize || null, fileUrl]
    );

    res.status(201).json({ message: "Document created", id: result.rows[0].id });
  } catch (err) {
    console.error("Create document error:", err);
    res.status(500).json({ message: "Failed to create document" });
  }
});

// ── DELETE /api/documents/:id ─────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ message: "Failed to delete document" });
  }
});

export default router;

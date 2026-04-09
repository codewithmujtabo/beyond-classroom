import { Router, Request, Response } from "express";
import { pool } from "../config/database";
import { authMiddleware } from "../middleware/auth";
import { createSnapToken } from "../services/midtrans.service";

const router = Router();
router.use(authMiddleware);

/**
 * POST /api/payments/snap
 *
 * Body: { registrationId: string }
 *
 * Returns a Midtrans Snap token + redirect URL so the client can open the
 * payment sheet. Sprint 1: token generation + DB record only.
 * Webhook handling (status updates) comes in Sprint 2.
 */
router.post("/snap", async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      res.status(400).json({ message: "registrationId is required" });
      return;
    }

    // Load the registration + competition + user in one query
    const result = await pool.query(
      `SELECT
         r.id         AS reg_id,
         r.comp_id,
         r.meta,
         c.name       AS competition_name,
         c.fee,
         u.full_name,
         u.email
       FROM registrations r
       JOIN competitions c ON c.id = r.comp_id
       JOIN users u ON u.id = r.user_id
       WHERE r.id = $1 AND r.user_id = $2`,
      [registrationId, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Registration not found" });
      return;
    }

    const row = result.rows[0];

    if (row.fee === 0) {
      res.status(400).json({ message: "This competition is free — no payment required" });
      return;
    }

    // Check for an existing pending payment to avoid duplicate Snap tokens
    const existing = await pool.query(
      `SELECT id, payment_id FROM payments
       WHERE registration_id = $1 AND payment_status = 'pending'
       LIMIT 1`,
      [registrationId]
    );

    if (existing.rows.length > 0 && existing.rows[0].payment_id) {
      // Re-use the existing snap token rather than generating a new one
      res.json({
        snapToken: existing.rows[0].payment_id,
        paymentId: existing.rows[0].id,
      });
      return;
    }

    const { snapToken, redirectUrl } = await createSnapToken({
      orderId: registrationId,
      amount: row.fee,
      customerName: row.full_name,
      customerEmail: row.email,
      competitionName: row.competition_name,
    });

    // Persist the payment record (snap token stored in payment_id for now)
    const paymentResult = await pool.query(
      `INSERT INTO payments (registration_id, user_id, amount, payment_status, payment_id)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING id`,
      [registrationId, req.userId, row.fee, snapToken]
    );

    res.status(201).json({
      snapToken,
      redirectUrl,
      paymentId: paymentResult.rows[0].id,
    });
  } catch (err: any) {
    console.error("Create snap token error:", err);
    res.status(500).json({ message: err.message || "Failed to create payment" });
  }
});

export default router;

import crypto from "crypto";
import { Router, Request, Response } from "express";
import { pool } from "../config/database";
import { env } from "../config/env";
import { authMiddleware } from "../middleware/auth";
import { createSnapToken } from "../services/midtrans.service";

const router = Router();

// ── POST /api/payments/webhook ────────────────────────────────────────────────
// Midtrans calls this directly — no auth middleware.
// https://docs.midtrans.com/reference/handling-notifications
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      transaction_id,
      transaction_status,
      payment_type,
      fraud_status,
      signature_key,
    } = req.body;

    // ── Signature verification ─────────────────────────────────────────────
    const expectedSig = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${env.MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    if (expectedSig !== signature_key) {
      console.warn("Midtrans webhook: invalid signature for order", order_id);
      res.status(403).json({ message: "Invalid signature" });
      return;
    }

    // ── Look up the payment record ─────────────────────────────────────────
    const paymentResult = await pool.query(
      `SELECT id, registration_id FROM payments WHERE order_id = $1 LIMIT 1`,
      [order_id]
    );

    if (paymentResult.rows.length === 0) {
      // Might arrive before the INSERT completes on slow networks — log and 200
      console.warn("Midtrans webhook: no payment found for order_id", order_id);
      res.json({ message: "OK" });
      return;
    }

    const { id: paymentDbId, registration_id } = paymentResult.rows[0];

    // ── Determine new statuses ─────────────────────────────────────────────
    // settlement = non-card success; capture + accept = card success
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    let newPaymentStatus: string;
    let newRegStatus: string | null = null;

    if (isSuccess) {
      newPaymentStatus = "settlement";
      newRegStatus = "paid";
    } else if (transaction_status === "pending") {
      newPaymentStatus = "pending";
    } else if (["deny", "cancel", "expire", "failure"].includes(transaction_status)) {
      newPaymentStatus = transaction_status;
    } else {
      newPaymentStatus = transaction_status ?? "unknown";
    }

    // ── Update payments row ────────────────────────────────────────────────
    await pool.query(
      `UPDATE payments
         SET payment_status = $1,
             payment_id     = $2,
             payment_method = $3,
             updated_at     = now()
       WHERE id = $4`,
      [newPaymentStatus, transaction_id ?? null, payment_type ?? null, paymentDbId]
    );

    // ── Update registration on success ─────────────────────────────────────
    if (newRegStatus) {
      await pool.query(
        `UPDATE registrations SET status = $1 WHERE id = $2`,
        [newRegStatus, registration_id]
      );
    }

    console.log(
      `Payment webhook: order=${order_id} status=${newPaymentStatus} reg=${registration_id}`
    );
    res.json({ message: "OK" });
  } catch (err: any) {
    console.error("Payment webhook error:", err);
    res.status(500).json({ message: "Internal error" });
  }
});

// All routes below require auth ───────────────────────────────────────────────
router.use(authMiddleware);

// ── POST /api/payments/snap ───────────────────────────────────────────────────
router.post("/snap", async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      res.status(400).json({ message: "registrationId is required" });
      return;
    }

    // Load registration + competition + user
    const result = await pool.query(
      `SELECT
         r.id         AS reg_id,
         r.status     AS reg_status,
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

    if (row.reg_status === "paid") {
      res.status(400).json({ message: "This registration is already paid" });
      return;
    }

    // Re-use an existing pending Snap token to avoid duplicate charges
    const existing = await pool.query(
      `SELECT id, snap_token, order_id FROM payments
       WHERE registration_id = $1
         AND payment_status = 'pending'
         AND snap_token IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [registrationId]
    );

    if (existing.rows.length > 0) {
      const { id, snap_token, order_id } = existing.rows[0];
      const subdomain = env.MIDTRANS_IS_PRODUCTION ? "app" : "app.sandbox";
      res.json({
        snapToken:   snap_token,
        redirectUrl: `https://${subdomain}.midtrans.com/snap/v2/vtweb/${snap_token}`,
        paymentId:   id,
        orderId:     order_id,
      });
      return;
    }

    // Generate a unique order_id — Midtrans rejects reused order_ids after expiry
    const orderId = `PAY-${registrationId}-${Date.now()}`.slice(0, 50);

    const { snapToken, redirectUrl } = await createSnapToken({
      orderId,
      amount:          row.fee,
      customerName:    row.full_name,
      customerEmail:   row.email,
      competitionName: row.competition_name,
    });

    const paymentResult = await pool.query(
      `INSERT INTO payments
         (registration_id, user_id, amount, payment_status, snap_token, order_id)
       VALUES ($1, $2, $3, 'pending', $4, $5)
       RETURNING id`,
      [registrationId, req.userId, row.fee, snapToken, orderId]
    );

    res.status(201).json({
      snapToken,
      redirectUrl,
      paymentId: paymentResult.rows[0].id,
      orderId,
    });
  } catch (err: any) {
    console.error("Create snap token error:", err);
    res.status(500).json({ message: err.message || "Failed to create payment" });
  }
});

export default router;

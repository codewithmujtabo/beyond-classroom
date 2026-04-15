/**
 * Cron Service
 * Sprint 3, Track A, Phase 4 (T4.5, T4.6)
 *
 * Scheduled tasks for sending deadline and competition day reminders.
 */

import cron from "node-cron";
import { pool } from "../config/database";
import * as pushService from "./push.service";

/**
 * T4.5 — Send deadline reminders (3 days before registration close)
 * Runs daily at 9:00 AM to check for upcoming deadlines
 */
export function scheduleDeadlineReminders() {
  // Run every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("[Cron] Running deadline reminder job...");

      // Find competitions closing in exactly 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      threeDaysFromNow.setHours(0, 0, 0, 0); // Start of day

      const endOfDay = new Date(threeDaysFromNow);
      endOfDay.setHours(23, 59, 59, 999); // End of day

      const result = await pool.query(
        `SELECT id, name, reg_close FROM competitions
         WHERE reg_close >= $1 AND reg_close <= $2`,
        [threeDaysFromNow.toISOString(), endOfDay.toISOString()]
      );

      if (result.rows.length === 0) {
        console.log("[Cron] No competitions closing in 3 days");
        return;
      }

      // For each competition, get all registered users
      for (const comp of result.rows) {
        const userResult = await pool.query(
          `SELECT DISTINCT user_id FROM registrations WHERE comp_id = $1`,
          [comp.id]
        );

        if (userResult.rows.length === 0) {
          continue;
        }

        const userIds = userResult.rows.map((r) => r.user_id);

        // Send batch notification
        const sent = await pushService.sendBatchNotifications(
          userIds,
          "Registration Closing Soon!",
          `Registration for ${comp.name} closes in 3 days. Complete your payment if needed.`,
          { type: "deadline_reminder", compId: comp.id }
        );

        console.log(`[Cron] Sent ${sent} deadline reminders for ${comp.name}`);
      }
    } catch (error: any) {
      console.error("[Cron] Deadline reminder job failed:", error.message);
    }
  });

  console.log("[Cron] Deadline reminder job scheduled (daily at 9:00 AM)");
}

/**
 * T4.6 — Send competition day reminders (1 day before start)
 * Runs daily at 9:00 AM to check for upcoming competitions
 */
export function scheduleCompetitionDayReminders() {
  // Run every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("[Cron] Running competition day reminder job...");

      // Find competitions starting in exactly 1 day
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
      oneDayFromNow.setHours(0, 0, 0, 0); // Start of day

      const endOfDay = new Date(oneDayFromNow);
      endOfDay.setHours(23, 59, 59, 999); // End of day

      const result = await pool.query(
        `SELECT id, name, start_date FROM competitions
         WHERE start_date >= $1 AND start_date <= $2`,
        [oneDayFromNow.toISOString(), endOfDay.toISOString()]
      );

      if (result.rows.length === 0) {
        console.log("[Cron] No competitions starting in 1 day");
        return;
      }

      // For each competition, get all paid/registered users
      for (const comp of result.rows) {
        const userResult = await pool.query(
          `SELECT DISTINCT user_id FROM registrations
           WHERE comp_id = $1 AND status IN ('paid', 'registered')`,
          [comp.id]
        );

        if (userResult.rows.length === 0) {
          continue;
        }

        const userIds = userResult.rows.map((r) => r.user_id);

        // Send batch notification
        const sent = await pushService.sendBatchNotifications(
          userIds,
          "Competition Tomorrow!",
          `${comp.name} starts tomorrow. Good luck!`,
          { type: "competition_reminder", compId: comp.id }
        );

        console.log(`[Cron] Sent ${sent} competition reminders for ${comp.name}`);
      }
    } catch (error: any) {
      console.error("[Cron] Competition day reminder job failed:", error.message);
    }
  });

  console.log("[Cron] Competition day reminder job scheduled (daily at 9:00 AM)");
}

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  scheduleDeadlineReminders();
  scheduleCompetitionDayReminders();
  console.log("[Cron] All cron jobs initialized");
}

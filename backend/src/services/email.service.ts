import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Your Beyond Classroom OTP Code",
    text: `Your verification code is: ${code}\n\nThis code is valid for ${env.OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this code, please ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Beyond Classroom</h2>
        <p>Your verification code is:</p>
        <div style="background: #F0F0FF; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code is valid for ${env.OTP_EXPIRY_MINUTES} minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  });
}

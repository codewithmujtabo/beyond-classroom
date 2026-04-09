import rateLimit from "express-rate-limit";

/**
 * OTP send limiter: 5 requests per 15 minutes per IP.
 * Protects against SMS/email spam that costs money.
 */
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please wait 15 minutes and try again." },
  keyGenerator: (req) => {
    // Key on IP + identifier (email or phone) to prevent per-target abuse
    const identifier = req.body?.email || req.body?.phone || "unknown";
    return `${req.ip}:${identifier}`;
  },
});

/**
 * OTP verify limiter: 10 attempts per hour per IP.
 * Protects against brute-force OTP guessing.
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many verification attempts. Please try again in an hour." },
  keyGenerator: (req) => {
    const identifier = req.body?.email || req.body?.phone || "unknown";
    return `${req.ip}:${identifier}`;
  },
});

/**
 * General auth limiter: 20 requests per 15 minutes per IP.
 * Applied to login + signup to slow down credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

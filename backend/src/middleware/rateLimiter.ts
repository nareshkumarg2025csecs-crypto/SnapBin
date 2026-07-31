import rateLimit from "express-rate-limit";

export const createPasteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many pastes created from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  skip: () => process.env.NODE_ENV === "test",
});

export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please slow down.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  skip: () => process.env.NODE_ENV === "test",
});

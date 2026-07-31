import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  logger.error(
    {
      err,
      method: req.method,
      url: req.url,
      statusCode,
    },
    "Request error"
  );

  res.status(statusCode).json({
    status: "error",
    message,
    code: err.code ?? "INTERNAL_ERROR",
  });
}

export function createError(
  message: string,
  statusCode: number,
  code?: string
): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

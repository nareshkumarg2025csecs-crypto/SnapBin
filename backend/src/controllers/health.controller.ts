import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      db: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (_err) {
    res.status(503).json({
      status: "error",
      db: "disconnected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
    next(_err);
  }
}

import { Router } from "express";
import { healthCheck } from "../controllers/health.controller";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 db: { type: string, example: connected }
 *                 uptime: { type: number }
 *                 timestamp: { type: string, format: date-time }
 *       503:
 *         description: Database unreachable
 */
router.get("/", healthCheck);

export default router;

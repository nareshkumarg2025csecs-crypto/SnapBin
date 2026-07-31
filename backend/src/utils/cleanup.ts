import cron from "node-cron";
import { prisma } from "../prisma/client";
import { logger } from "./logger";

export function startCleanupJob(): void {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await prisma.paste.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });
      if (result.count > 0) {
        logger.info({ count: result.count }, "Cleaned up expired pastes");
      }
    } catch (err) {
      logger.error({ err }, "Cleanup job failed");
    }
  });

  logger.info("Paste cleanup cron job started (every 5 minutes)");
}

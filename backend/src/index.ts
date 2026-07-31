import "dotenv/config";
import app from "./app";
import { logger } from "./utils/logger";
import { prisma } from "./prisma/client";
import { startCleanupJob } from "./utils/cleanup";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

async function bootstrap(): Promise<void> {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 3000;
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await prisma.$connect();
      logger.info("Database connected");
      break;
    } catch (err) {
      if (i === MAX_RETRIES - 1) {
        logger.error({ err }, "Failed to connect to database after multiple retries");
        await prisma.$disconnect();
        process.exit(1);
      }
      logger.warn(`Database connection failed, retrying in ${RETRY_DELAY_MS / 1000}s... (Attempt ${i + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  try {
    startCleanupJob();

    const server = app.listen(PORT, () => {
      logger.info({ port: PORT }, `SnapBin API running`);
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutting down gracefully");
      server.close(async () => {
        await prisma.$disconnect();
        logger.info("Database disconnected. Bye.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();

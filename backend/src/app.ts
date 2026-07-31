import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { globalRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import pastesRouter from "./routes/pastes";
import healthRouter from "./routes/health";
import { swaggerSpec } from "./utils/swagger";
import { logger } from "./utils/logger";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "X-Delete-Token"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip }, "Incoming request");
  next();
});

app.use("/api", globalRateLimiter);

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "SnapBin API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

app.use("/api/health", healthRouter);
app.use("/api/pastes", pastesRouter);

app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    code: "NOT_FOUND",
  });
});

app.use(errorHandler);

export default app;

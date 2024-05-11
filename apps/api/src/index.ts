import cors from "cors";
import express from "express";

import { logger } from "@repo/lib";

import { env } from "./env";

async function main() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      credentials: true,
    }),
  );

  app.get("/health", (_req, res) => {
    res.send("healthy");
  });

  const PORT = env.API_SERVER_PORT ? parseInt(env.API_SERVER_PORT) : 8000;

  app.listen(PORT, () => {
    logger.info(`Server listening on port http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});

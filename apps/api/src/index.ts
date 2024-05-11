import express from "express";
import { env } from "./env";

async function main() {
  const app = express();

  app.get("/health", (_req, res) => {
    res.send("healthy");
  });

  const PORT = env.API_SERVER_PORT ? parseInt(env.API_SERVER_PORT) : 8000;

  app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

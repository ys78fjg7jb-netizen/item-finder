import app from "./app";
import { logger } from "./lib/logger";
import { ensureDatabaseReady } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid port: "${rawPort}"`);
}

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Do not block the port health check on a cold Neon connection.
  void ensureDatabaseReady().catch((err) => {
    logger.error({ err }, "Database initialization failed");
  });
});

server.on("error", (err) => {
  logger.error({ err }, "API server error");
  process.exit(1);
});

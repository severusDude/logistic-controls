import process from "node:process";
import { createSubscriber } from "../lib/backend/mqtt/subscriber";
import { markOfflineDevices } from "../lib/backend/processors/offline-detector";
import { prisma } from "../lib/backend/db/prisma";

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  console.log("[worker] Database connection OK");

  const client = createSubscriber();
  const offlineInterval = setInterval(() => {
    void markOfflineDevices()
      .then((count) => {
        if (count > 0) {
          console.log(`[worker] Marked ${count} device(s) offline`);
        }
      })
      .catch((error) => {
        console.error("[worker] Offline detector failed", error);
      });
  }, 30_000);

  const shutdown = async (signal: string) => {
    console.log(`[worker] Received ${signal}, shutting down`);
    clearInterval(offlineInterval);
    client.end(true);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

main().catch(async (error) => {
  console.error("[worker] Fatal startup error", error);
  await prisma.$disconnect();
  process.exit(1);
});

import process from "node:process";
import mqtt from "mqtt";
import { getWorkerConfig } from "../lib/backend/config";
import { prisma } from "../lib/backend/db/prisma";

async function main() {
  const config = getWorkerConfig();
  const mqttUrl = config.MQTT_URL;
  const mqttClientId = config.MQTT_CLIENT_ID;

  if (!mqttUrl || !mqttClientId) {
    throw new Error("MQTT_URL and MQTT_CLIENT_ID are required for the backend worker");
  }

  await prisma.$queryRaw`SELECT 1`;
  console.log("[worker] Database connection OK");

  const client = mqtt.connect(mqttUrl, {
    clientId: mqttClientId,
    username: config.MQTT_USERNAME || undefined,
    password: config.MQTT_PASSWORD || undefined,
    reconnectPeriod: 1_000,
    connectTimeout: 5_000,
  });

  client.on("connect", () => {
    console.log(`[worker] MQTT connection OK (${mqttUrl})`);
    client.subscribe("logistics/health", { qos: 0 }, (error) => {
      if (error) {
        console.error("[worker] MQTT subscribe failed", error);
        process.exitCode = 1;
        client.end(true);
        return;
      }

      console.log("[worker] Subscribed to logistics/health");
    });
  });

  client.on("reconnect", () => {
    console.log("[worker] Reconnecting to MQTT broker");
  });

  client.on("error", (error) => {
    console.error("[worker] MQTT connection failed", error);
    process.exitCode = 1;
    client.end(true);
  });

  const shutdown = async (signal: string) => {
    console.log(`[worker] Received ${signal}, shutting down`);
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

import mqtt from "mqtt";
import { RawEventType } from "@/generated/prisma/client";
import { getWorkerConfig } from "../config";
import { parseMobileTopic } from "./topic-parser";
import { heartbeatPayloadSchema } from "../schemas/heartbeat";
import { scanPayloadSchema } from "../schemas/scan";
import { telemetryPayloadSchema } from "../schemas/telemetry";
import { persistRawEvent } from "../processors/raw-events";
import { processHeartbeat } from "../processors/heartbeat";
import { processScan } from "../processors/scan";
import { processTelemetry } from "../processors/telemetry";

const subscriptionTopics: string[] = [
  "logistics/mobile/+/telemetry",
  "logistics/mobile/+/scan",
  "logistics/mobile/+/heartbeat",
];

function getSchemaVersion(payload: unknown) {
  if (payload && typeof payload === "object" && "schema_version" in payload) {
    const schemaVersion = Reflect.get(payload, "schema_version");
    return typeof schemaVersion === "string" ? schemaVersion : null;
  }

  return null;
}

function getEventType(topicType: "telemetry" | "scan" | "heartbeat") {
  switch (topicType) {
    case "telemetry":
      return RawEventType.telemetry;
    case "scan":
      return RawEventType.scan;
    case "heartbeat":
      return RawEventType.heartbeat;
  }
}

export function createSubscriber() {
  const config = getWorkerConfig();
  const mqttUrl = config.MQTT_URL;
  const mqttClientId = config.MQTT_CLIENT_ID;

  if (!mqttUrl || !mqttClientId) {
    throw new Error("MQTT_URL and MQTT_CLIENT_ID are required for the backend worker");
  }

  const client = mqtt.connect(mqttUrl, {
    clientId: mqttClientId,
    username: config.MQTT_USERNAME || undefined,
    password: config.MQTT_PASSWORD || undefined,
    reconnectPeriod: 1_000,
    connectTimeout: 5_000,
  });

  client.on("connect", () => {
    console.log(`[worker] MQTT connection OK (${mqttUrl})`);
    client.subscribe(subscriptionTopics, (error) => {
      if (error) {
        console.error("[worker] MQTT subscribe failed", error);
        return;
      }

      console.log("[worker] Subscribed to Phase 1 firmware topics");
    });
  });

  client.on("reconnect", () => {
    console.log("[worker] Reconnecting to MQTT broker");
  });

  client.on("error", (error) => {
    console.error("[worker] MQTT connection failed", error);
  });

  client.on("message", (topic, message, packet) => {
    void handleIncomingMessage(topic, message, packet.qos, packet.retain);
  });

  return client;
}

async function handleIncomingMessage(
  topic: string,
  message: Buffer,
  qos?: number,
  retain?: boolean,
) {
  const parsedTopic = parseMobileTopic(topic);

  if (!parsedTopic) {
    console.warn(`[worker] Ignored unsupported topic: ${topic}`);
    return;
  }

  let payload: unknown;

  try {
    payload = JSON.parse(message.toString("utf8"));
  } catch (error) {
    console.error(
      `[worker] Invalid JSON for ${parsedTopic.topicType} ${parsedTopic.deviceId}`,
      error,
    );
    return;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    console.error(
      `[worker] Invalid payload shape for ${parsedTopic.topicType} ${parsedTopic.deviceId}`,
    );
    return;
  }

  await persistRawEvent({
    topic,
    deviceId: parsedTopic.deviceId,
    eventType: getEventType(parsedTopic.topicType),
    qos,
    retain,
    payload,
    schemaVersion: getSchemaVersion(payload),
  });

  try {
    switch (parsedTopic.topicType) {
      case "telemetry": {
        const parsedPayload = telemetryPayloadSchema.parse(payload);

        if (parsedPayload.device_id !== parsedTopic.deviceId) {
          throw new Error("Payload device_id does not match topic device id");
        }

        const result = await processTelemetry(parsedPayload);
        console.log(
          `[worker] telemetry processed device=${result.deviceId} inserted=${result.insertedTelemetry} attachedPackages=${result.attachedPackages}`,
        );
        break;
      }
      case "scan": {
        const parsedPayload = scanPayloadSchema.parse(payload);

        if (parsedPayload.device_id !== parsedTopic.deviceId) {
          throw new Error("Payload device_id does not match topic device id");
        }

        const result = await processScan(parsedPayload);
        console.log(
          `[worker] scan processed device=${result.deviceId} skipped=${result.skipped}${result.reason ? ` reason=${result.reason}` : ""}`,
        );
        break;
      }
      case "heartbeat": {
        const parsedPayload = heartbeatPayloadSchema.parse(payload);

        if (parsedPayload.device_id !== parsedTopic.deviceId) {
          throw new Error("Payload device_id does not match topic device id");
        }

        const result = await processHeartbeat(parsedPayload);
        console.log(`[worker] heartbeat processed device=${result.deviceId}`);
        break;
      }
    }
  } catch (error) {
    console.error(
      `[worker] Failed to process ${parsedTopic.topicType} for ${parsedTopic.deviceId}`,
      error,
    );
  }
}

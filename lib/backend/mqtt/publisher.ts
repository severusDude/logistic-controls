import mqtt from "mqtt";
import { randomUUID } from "node:crypto";
import { getAppConfig } from "../config";

type PublishMqttMessageInput = {
  topic: string;
  payload: string;
  qos: 0 | 1 | 2;
  retain?: boolean;
};

export async function publishMqttMessage(input: PublishMqttMessageInput) {
  const config = getAppConfig();

  if (!config.MQTT_URL || !config.MQTT_CLIENT_ID) {
    throw new Error("MQTT publishing is not configured");
  }

  const client = mqtt.connect(config.MQTT_URL, {
    clientId: `${config.MQTT_CLIENT_ID}-publisher-${randomUUID().slice(0, 8)}`,
    username: config.MQTT_USERNAME || undefined,
    password: config.MQTT_PASSWORD || undefined,
    reconnectPeriod: 0,
    connectTimeout: 5_000,
  });

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for MQTT publish"));
    }, 10_000);

    const cleanup = () => {
      clearTimeout(timeout);
      client.removeListener("connect", onConnect);
      client.removeListener("error", onError);
      client.end();
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onConnect = () => {
      client.publish(
        input.topic,
        input.payload,
        { qos: input.qos, retain: input.retain ?? false },
        (error) => {
          if (error) {
            cleanup();
            reject(error);
            return;
          }

          cleanup();
          resolve();
        },
      );
    };

    client.once("connect", onConnect);
    client.once("error", onError);
  });
}

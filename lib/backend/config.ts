import { loadEnvConfig } from "@next/env";
import { z } from "zod";

let envLoaded = false;

function ensureEnvLoaded() {
  if (!envLoaded) {
    loadEnvConfig(process.cwd());
    envLoaded = true;
  }
}

const baseSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(31),
  MQTT_URL: z.string().trim().optional(),
  MQTT_USERNAME: z.string().optional(),
  MQTT_PASSWORD: z.string().optional(),
  MQTT_CLIENT_ID: z.string().trim().optional(),
});

const workerSchema = baseSchema.superRefine((env, ctx) => {
  if (!env.MQTT_URL) {
    ctx.addIssue({
      code: "custom",
      path: ["MQTT_URL"],
      message: "MQTT_URL is required for the backend worker",
    });
  }

  if (!env.MQTT_CLIENT_ID) {
    ctx.addIssue({
      code: "custom",
      path: ["MQTT_CLIENT_ID"],
      message: "MQTT_CLIENT_ID is required for the backend worker",
    });
  }
});

export type AppConfig = z.infer<typeof baseSchema> & {
  mqttConfigured: boolean;
};

export type WorkerConfig = z.infer<typeof workerSchema>;

export function getAppConfig(): AppConfig {
  ensureEnvLoaded();

  const parsed = baseSchema.parse(process.env);

  return {
    ...parsed,
    mqttConfigured: Boolean(parsed.MQTT_URL && parsed.MQTT_CLIENT_ID),
  };
}

export function getWorkerConfig(): WorkerConfig {
  ensureEnvLoaded();
  return workerSchema.parse(process.env);
}

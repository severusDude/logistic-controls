import { Prisma, RawEventType } from "@/generated/prisma/client";
import { prisma } from "../db/prisma";

type PersistRawEventInput = {
  topic: string;
  deviceId?: string | null;
  eventType: RawEventType;
  qos?: number;
  retain?: boolean;
  payload: unknown;
  schemaVersion?: string | null;
};

export async function persistRawEvent(input: PersistRawEventInput) {
  return prisma.rawMqttEvent.create({
    data: {
      topic: input.topic,
      deviceId: input.deviceId ?? null,
      eventType: input.eventType,
      qos: input.qos ?? null,
      retain: input.retain ?? null,
      payload: input.payload as Prisma.InputJsonValue,
      schemaVersion: input.schemaVersion ?? null,
    },
  });
}

import { RawEventType } from "@/generated/prisma/client";
import { prisma } from "../db/prisma";

type RawEventFilter = {
  deviceId?: string;
  type?: RawEventType;
  limit?: number;
};

export async function getRawEvents(filter: RawEventFilter) {
  const limit = Math.min(filter.limit ?? 50, 200);

  return prisma.rawMqttEvent.findMany({
    where: {
      deviceId: filter.deviceId ?? undefined,
      eventType: filter.type ?? undefined,
    },
    orderBy: {
      ingestedAt: "desc",
    },
    take: limit,
  });
}

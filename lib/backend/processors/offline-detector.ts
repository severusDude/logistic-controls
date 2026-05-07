import { DeviceStatus } from "@/generated/prisma/client";
import { prisma } from "../db/prisma";

const OFFLINE_THRESHOLD_MS = 90_000;

export async function markOfflineDevices() {
  const threshold = new Date(Date.now() - OFFLINE_THRESHOLD_MS);

  const result = await prisma.device.updateMany({
    where: {
      status: { not: DeviceStatus.offline },
      lastHeartbeatAt: {
        lt: threshold,
      },
    },
    data: {
      status: DeviceStatus.offline,
    },
  });

  return result.count;
}

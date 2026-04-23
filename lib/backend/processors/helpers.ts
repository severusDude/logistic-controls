import {
  DeviceStatus,
  DeviceType,
  type Device,
  type Facility,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "../db/prisma";

export function toDecimal(value: number) {
  return new Prisma.Decimal(value);
}

export async function findFacilityByCode(facilityCode: string) {
  return prisma.facility.findUnique({
    where: { facilityCode },
  });
}

type UpsertDeviceInput = {
  deviceId: string;
  deviceType: DeviceType;
  deviceRole?: string | null;
  facility?: Facility | null;
  locationName?: string | null;
  status?: DeviceStatus;
  lastSeenAt?: Date | null;
  lastHeartbeatAt?: Date | null;
  lastTelemetryAt?: Date | null;
  lastLat?: number | null;
  lastLng?: number | null;
  gpsFix?: boolean | null;
  batteryPct?: number | null;
  wifiRssi?: number | null;
  signalStrength?: string | null;
  uptimeSec?: number | null;
};

export async function upsertDeviceState(input: UpsertDeviceInput): Promise<Device> {
  const existing = await prisma.device.findUnique({
    where: { deviceId: input.deviceId },
  });

  const baseData = {
    deviceType: input.deviceType,
    deviceRole: input.deviceRole ?? existing?.deviceRole ?? "truck",
    facilityId: input.facility?.id ?? existing?.facilityId ?? null,
    locationName: input.locationName ?? existing?.locationName ?? null,
    status: input.status ?? existing?.status ?? DeviceStatus.idle,
    lastSeenAt: input.lastSeenAt ?? existing?.lastSeenAt ?? null,
    lastHeartbeatAt: input.lastHeartbeatAt ?? existing?.lastHeartbeatAt ?? null,
    lastTelemetryAt: input.lastTelemetryAt ?? existing?.lastTelemetryAt ?? null,
    lastLat:
      input.lastLat !== undefined
        ? input.lastLat === null
          ? null
          : toDecimal(input.lastLat)
        : existing?.lastLat ?? null,
    lastLng:
      input.lastLng !== undefined
        ? input.lastLng === null
          ? null
          : toDecimal(input.lastLng)
        : existing?.lastLng ?? null,
    gpsFix: input.gpsFix ?? existing?.gpsFix ?? null,
    batteryPct: input.batteryPct ?? existing?.batteryPct ?? null,
    wifiRssi: input.wifiRssi ?? existing?.wifiRssi ?? null,
    signalStrength: input.signalStrength ?? existing?.signalStrength ?? null,
    uptimeSec: input.uptimeSec ?? existing?.uptimeSec ?? null,
  };

  if (existing) {
    return prisma.device.update({
      where: { id: existing.id },
      data: baseData,
    });
  }

  return prisma.device.create({
    data: {
      deviceId: input.deviceId,
      ...baseData,
    },
  });
}

export function isZeroCoordinate(lat: number, lng: number) {
  return lat === 0 && lng === 0;
}

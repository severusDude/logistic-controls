import { DeviceStatus, DeviceType, PackageStatus } from "@/generated/prisma/client";
import { prisma } from "../db/prisma";
import type { TelemetryPayload } from "../schemas/telemetry";
import {
  findFacilityByCode,
  isZeroCoordinate,
  toDecimal,
  upsertDeviceState,
} from "./helpers";

export async function processTelemetry(payload: TelemetryPayload) {
  const facility = await findFacilityByCode(payload.facility_id);
  const hasUsableGps =
    payload.gps_fix && !isZeroCoordinate(payload.gps.lat, payload.gps.lng);

  const device = await upsertDeviceState({
    deviceId: payload.device_id,
    deviceType: DeviceType.mobile,
    facility,
    status: DeviceStatus.online,
    lastSeenAt: payload.timestamp_utc,
    lastTelemetryAt: payload.timestamp_utc,
    lastLat: hasUsableGps ? payload.gps.lat : undefined,
    lastLng: hasUsableGps ? payload.gps.lng : undefined,
    gpsFix: payload.gps_fix,
    batteryPct: payload.battery_pct ?? null,
    signalStrength: payload.signal_strength ?? null,
  });

  const existingTelemetry = await prisma.deviceTelemetry.findFirst({
    where: {
      deviceId: device.id,
      sequenceNo: payload.sequence_no,
    },
    select: { id: true },
  });

  if (!existingTelemetry) {
    await prisma.deviceTelemetry.create({
      data: {
        deviceId: device.id,
        sequenceNo: payload.sequence_no,
        timestampUtc: payload.timestamp_utc,
        lat: toDecimal(payload.gps.lat),
        lng: toDecimal(payload.gps.lng),
        altitudeM: payload.gps.altitude_m ?? null,
        accuracyM: payload.gps.accuracy_m ?? null,
        headingDeg: payload.gps.heading_deg ?? null,
        speedKmh: payload.gps.speed_kmh ?? null,
        activePackageCount: payload.active_package_count ?? null,
        batteryPct: payload.battery_pct ?? null,
        signalStrength: payload.signal_strength ?? null,
        gpsFix: payload.gps_fix,
        rawPayload: payload,
      },
    });
  }

  const attachedPackages = await prisma.package.findMany({
    where: { currentDeviceId: device.id },
    select: {
      id: true,
      status: true,
    },
  });

  for (const pkg of attachedPackages) {
    await prisma.package.update({
      where: { id: pkg.id },
      data: {
        lastEventAt: payload.timestamp_utc,
        ...(hasUsableGps
          ? {
              lastKnownLat: toDecimal(payload.gps.lat),
              lastKnownLng: toDecimal(payload.gps.lng),
            }
          : {}),
        status:
          pkg.status === PackageStatus.picked_up
            ? PackageStatus.in_transit
            : pkg.status,
      },
    });
  }

  return {
    deviceId: payload.device_id,
    insertedTelemetry: !existingTelemetry,
    attachedPackages: attachedPackages.length,
  };
}

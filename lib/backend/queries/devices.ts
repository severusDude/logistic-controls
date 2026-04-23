import { prisma } from "../db/prisma";
import { decimalPoint } from "./shared";

export async function getDeviceSnapshots() {
  const devices = await prisma.device.findMany({
    include: {
      facility: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return devices.map((device) => ({
    deviceId: device.deviceId,
    deviceType: device.deviceType,
    deviceRole: device.deviceRole,
    facilityCode: device.facility?.facilityCode ?? null,
    facilityName: device.facility?.name ?? null,
    locationName: device.locationName,
    status: device.status,
    lastSeenAt: device.lastSeenAt,
    lastHeartbeatAt: device.lastHeartbeatAt,
    lastTelemetryAt: device.lastTelemetryAt,
    gpsFix: device.gpsFix,
    batteryPct: device.batteryPct,
    wifiRssi: device.wifiRssi,
    signalStrength: device.signalStrength,
    lastPosition: decimalPoint(device.lastLat, device.lastLng),
  }));
}

export async function getDeviceSnapshot(deviceId: string) {
  const device = await prisma.device.findUnique({
    where: { deviceId },
    include: {
      facility: true,
      telemetry: {
        orderBy: { timestampUtc: "desc" },
        take: 1,
      },
      heartbeats: {
        orderBy: { timestampUtc: "desc" },
        take: 1,
      },
      _count: {
        select: {
          packages: true,
        },
      },
    },
  });

  if (!device) {
    return null;
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentRawEventCount = await prisma.rawMqttEvent.count({
    where: {
      deviceId,
      ingestedAt: {
        gte: oneHourAgo,
      },
    },
  });

  const latestTelemetry = device.telemetry[0] ?? null;
  const latestHeartbeat = device.heartbeats[0] ?? null;

  return {
    deviceId: device.deviceId,
    deviceType: device.deviceType,
    deviceRole: device.deviceRole,
    facilityCode: device.facility?.facilityCode ?? null,
    facilityName: device.facility?.name ?? null,
    locationName: device.locationName,
    status: device.status,
    lastSeenAt: device.lastSeenAt,
    lastHeartbeatAt: device.lastHeartbeatAt,
    lastTelemetryAt: device.lastTelemetryAt,
    gpsFix: device.gpsFix,
    batteryPct: device.batteryPct,
    wifiRssi: device.wifiRssi,
    signalStrength: device.signalStrength,
    lastPosition: decimalPoint(device.lastLat, device.lastLng),
    latestTelemetry: latestTelemetry
      ? {
          timestampUtc: latestTelemetry.timestampUtc,
          sequenceNo: latestTelemetry.sequenceNo,
          gpsFix: latestTelemetry.gpsFix,
          activePackageCount: latestTelemetry.activePackageCount,
          batteryPct: latestTelemetry.batteryPct,
          signalStrength: latestTelemetry.signalStrength,
          position: decimalPoint(latestTelemetry.lat, latestTelemetry.lng),
          altitudeM: latestTelemetry.altitudeM,
          accuracyM: latestTelemetry.accuracyM,
          headingDeg: latestTelemetry.headingDeg,
          speedKmh: latestTelemetry.speedKmh,
        }
      : null,
    latestHeartbeat: latestHeartbeat
      ? {
          timestampUtc: latestHeartbeat.timestampUtc,
          uptimeSec: latestHeartbeat.uptimeSec,
          statusText: latestHeartbeat.statusText,
          rfidReaderStatus: latestHeartbeat.rfidReaderStatus,
          gpsFix: latestHeartbeat.gpsFix,
          packagesScannedToday: latestHeartbeat.packagesScannedToday,
          wifiRssi: latestHeartbeat.wifiRssi,
        }
      : null,
    attachedPackageCount: device._count.packages,
    recentRawEventCount,
  };
}

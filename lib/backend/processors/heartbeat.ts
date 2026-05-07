import { DeviceStatus, DeviceType } from "@/generated/prisma/client";
import type { HeartbeatPayload } from "../schemas/heartbeat";
import { findFacilityByCode, upsertDeviceState } from "./helpers";
import { prisma } from "../db/prisma";

export async function processHeartbeat(payload: HeartbeatPayload) {
  const facility = await findFacilityByCode(payload.facility_id);

  const device = await upsertDeviceState({
    deviceId: payload.device_id,
    deviceType: DeviceType.mobile,
    deviceRole: payload.device_role,
    facility,
    status: DeviceStatus.online,
    lastSeenAt: payload.timestamp_utc,
    lastHeartbeatAt: payload.timestamp_utc,
    gpsFix: payload.gps_fix ?? null,
    wifiRssi: payload.wifi_rssi ?? null,
    uptimeSec: payload.uptime_sec ?? null,
  });

  await prisma.deviceHeartbeat.create({
    data: {
      deviceId: device.id,
      timestampUtc: payload.timestamp_utc,
      uptimeSec: payload.uptime_sec ?? null,
      statusText: payload.status,
      rfidReaderStatus: payload.rfid_reader_status ?? null,
      gpsFix: payload.gps_fix ?? null,
      packagesScannedToday: payload.packages_scanned_today ?? null,
      wifiRssi: payload.wifi_rssi ?? null,
      rawPayload: payload,
    },
  });

  return {
    deviceId: payload.device_id,
  };
}

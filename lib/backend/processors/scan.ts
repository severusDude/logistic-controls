import { DeviceStatus, DeviceType, PackageStatus } from "@/generated/prisma/client";
import { prisma } from "../db/prisma";
import type { ScanPayload } from "../schemas/scan";
import { findFacilityByCode, toDecimal, upsertDeviceState } from "./helpers";

function mapScanStatus(scanContext: ScanPayload["scan_context"]) {
  return scanContext === "pickup"
    ? PackageStatus.picked_up
    : PackageStatus.in_transit;
}

export async function processScan(payload: ScanPayload) {
  const existingEvent = await prisma.packageEvent.findUnique({
    where: { eventId: payload.event_id },
    select: { id: true },
  });

  if (existingEvent) {
    return {
      deviceId: payload.device_id,
      skipped: true,
      reason: "duplicate_event_id",
    };
  }

  const facility = await findFacilityByCode(payload.facility_id);
  const device = await upsertDeviceState({
    deviceId: payload.device_id,
    deviceType: DeviceType.mobile,
    deviceRole: payload.device_role,
    facility,
    locationName: payload.location_name,
    status: DeviceStatus.online,
    lastSeenAt: payload.timestamp_utc,
  });

  const pkg = await prisma.package.findUnique({
    where: { rfidEpc: payload.rfid_epc },
    select: { id: true },
  });

  if (!pkg) {
    await prisma.unknownScan.upsert({
      where: { eventId: payload.event_id },
      update: {
        deviceId: device.id,
        facilityId: facility?.id ?? null,
        rfidEpc: payload.rfid_epc,
        reason: "package_not_found_for_rfid_epc",
        timestampUtc: payload.timestamp_utc,
        rawPayload: payload,
      },
      create: {
        eventId: payload.event_id,
        deviceId: device.id,
        facilityId: facility?.id ?? null,
        rfidEpc: payload.rfid_epc,
        reason: "package_not_found_for_rfid_epc",
        timestampUtc: payload.timestamp_utc,
        rawPayload: payload,
      },
    });

    return {
      deviceId: payload.device_id,
      skipped: true,
      reason: "unknown_rfid",
    };
  }

  const mappedStatus = mapScanStatus(payload.scan_context);

  await prisma.packageEvent.create({
    data: {
      eventId: payload.event_id,
      packageId: pkg.id,
      sourceType: "scan",
      status: mappedStatus,
      scanContext: payload.scan_context,
      deviceId: device.id,
      facilityId: facility?.id ?? null,
      locationName: payload.location_name,
      lat: payload.device_gps ? toDecimal(payload.device_gps.lat) : null,
      lng: payload.device_gps ? toDecimal(payload.device_gps.lng) : null,
      timestampUtc: payload.timestamp_utc,
      rawPayload: payload,
    },
  });

  await prisma.package.update({
    where: { id: pkg.id },
    data: {
      status: mappedStatus,
      currentFacilityId: facility?.id ?? null,
      currentDeviceId: device.id,
      lastEventAt: payload.timestamp_utc,
      ...(payload.device_gps
        ? {
            lastKnownLat: toDecimal(payload.device_gps.lat),
            lastKnownLng: toDecimal(payload.device_gps.lng),
          }
        : {}),
    },
  });

  return {
    deviceId: payload.device_id,
    skipped: false,
    reason: null,
  };
}

import { prisma } from "../db/prisma";
import { decimalPoint } from "./shared";

export async function getPackageTimeline(trackingId: string) {
  const pkg = await prisma.package.findUnique({
    where: { trackingId },
    include: {
      currentDevice: true,
      currentFacility: true,
      events: {
        include: {
          device: true,
          facility: true,
        },
        orderBy: {
          timestampUtc: "desc",
        },
      },
    },
  });

  if (!pkg) {
    return null;
  }

  return {
    trackingId: pkg.trackingId,
    rfidEpc: pkg.rfidEpc,
    status: pkg.status,
    currentDeviceId: pkg.currentDevice?.deviceId ?? null,
    currentFacilityCode: pkg.currentFacility?.facilityCode ?? null,
    lastKnownPosition: decimalPoint(pkg.lastKnownLat, pkg.lastKnownLng),
    lastEventAt: pkg.lastEventAt,
    timeline: pkg.events.map((event) => ({
      eventId: event.eventId,
      sourceType: event.sourceType,
      status: event.status,
      scanContext: event.scanContext,
      deviceId: event.device?.deviceId ?? null,
      facilityCode: event.facility?.facilityCode ?? null,
      locationName: event.locationName,
      lat: decimalPoint(event.lat, event.lng)?.lat ?? null,
      lng: decimalPoint(event.lat, event.lng)?.lng ?? null,
      timestampUtc: event.timestampUtc,
    })),
  };
}

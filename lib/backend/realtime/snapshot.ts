import { RawEventType } from "@/generated/prisma/client";
import type {
  ConnectionStatus,
  Device,
  DeviceRole,
  TerminalCategory,
  TerminalEntry,
  TerminalLevel,
} from "@/lib/simcon/types";
import { prisma } from "../db/prisma";
import { decimalToNumber } from "../queries/shared";
import type {
  RealtimePackageEvent,
  RealtimeSnapshot,
  RealtimeWatermarks,
} from "./contracts";

const MAX_TERMINAL_ENTRIES = 50;
const MAX_PACKAGE_EVENTS = 20;
const RECENT_THROUGHPUT_WINDOW_MS = 5 * 60 * 1000;

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false,
  }).format(date);
}

function formatRelativeTime(date: Date | null | undefined) {
  if (!date) {
    return "never";
  }

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1_000));

  if (seconds < 5) {
    return "now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function normalizeRole(deviceRole: string, fallback: Device["type"]): DeviceRole {
  if (deviceRole === "truck" || deviceRole === "scanner" || deviceRole === "gateway") {
    return deviceRole;
  }

  return fallback === "mobile" ? "truck" : "gateway";
}

function mapConnectionStatus(
  status: Device["status"],
  gpsFix: boolean | null,
): ConnectionStatus {
  if (status === "offline") {
    return "offline";
  }

  if (status === "idle") {
    return "rebuilding";
  }

  if (status === "warning" || gpsFix === false) {
    return "degraded";
  }

  return "connected";
}

function buildTelemetryMessage(
  deviceId: string | null,
  payload: Record<string, unknown>,
) {
  const gps = typeof payload.gps === "object" && payload.gps ? payload.gps as Record<string, unknown> : null;
  const gpsFix = payload.gps_fix === true;
  const speed = typeof gps?.speed_kmh === "number" ? gps.speed_kmh.toFixed(1) : "0.0";
  const batteryPct = typeof payload.battery_pct === "number" ? `${payload.battery_pct}%` : "--";

  if (!gpsFix) {
    return {
      level: "warning" as TerminalLevel,
      message: `${deviceId ?? "unknown"} telemetry received with GPS fix lost.`,
      badge: "GPS LOST",
    };
  }

  return {
    level: "neutral" as TerminalLevel,
    message: `${deviceId ?? "unknown"} telemetry ${speed} km/h battery ${batteryPct}.`,
    badge: null,
  };
}

function buildHeartbeatMessage(
  deviceId: string | null,
  payload: Record<string, unknown>,
) {
  const status = typeof payload.status === "string" ? payload.status : "unknown";
  const uptime = typeof payload.uptime_sec === "number" ? `${payload.uptime_sec}s` : "n/a";

  return {
    level: status === "online" ? ("success" as TerminalLevel) : ("warning" as TerminalLevel),
    message: `${deviceId ?? "unknown"} heartbeat ${status}. uptime ${uptime}.`,
    badge: status === "online" ? null : "WATCH",
  };
}

function buildScanMessage(
  deviceId: string | null,
  payload: Record<string, unknown>,
  unknownEventIds: Set<string>,
) {
  const scanContext = typeof payload.scan_context === "string" ? payload.scan_context : "unknown";
  const epc = typeof payload.rfid_epc === "string" ? payload.rfid_epc : "unknown";
  const eventId = typeof payload.event_id === "string" ? payload.event_id : null;

  if (eventId && unknownEventIds.has(eventId)) {
    return {
      level: "error" as TerminalLevel,
      message: `${deviceId ?? "unknown"} scan ${scanContext} ${epc} rejected. package not found.`,
      badge: "UNKNOWN",
    };
  }

  return {
    level: "info" as TerminalLevel,
    message: `${deviceId ?? "unknown"} scan ${scanContext} ${epc}.`,
    badge: scanContext.toUpperCase(),
  };
}

function mapRawEventCategory(eventType: RawEventType): TerminalCategory {
  switch (eventType) {
    case RawEventType.heartbeat:
      return "HEARTBEAT";
    case RawEventType.scan:
      return "SCAN_EVT";
    case RawEventType.telemetry:
      return "TELEMETRY";
    default:
      return "SYS";
  }
}

async function getTerminalEntries(): Promise<TerminalEntry[]> {
  const rawEvents = await prisma.rawMqttEvent.findMany({
    orderBy: { ingestedAt: "desc" },
    take: MAX_TERMINAL_ENTRIES,
  });

  const scanEventIds = rawEvents
    .filter((event) => event.eventType === RawEventType.scan)
    .map((event) => {
      const payload =
        event.payload && typeof event.payload === "object" && !Array.isArray(event.payload)
          ? (event.payload as Record<string, unknown>)
          : null;

      return typeof payload?.event_id === "string" ? payload.event_id : null;
    })
    .filter((eventId): eventId is string => Boolean(eventId));

  const unknownScans = scanEventIds.length
    ? await prisma.unknownScan.findMany({
        where: {
          eventId: { in: scanEventIds },
        },
        select: { eventId: true },
      })
    : [];

  const unknownEventIds = new Set(
    unknownScans
      .map((scan) => scan.eventId)
      .filter((eventId): eventId is string => Boolean(eventId)),
  );

  return rawEvents.map((event) => {
    const payload =
      event.payload && typeof event.payload === "object" && !Array.isArray(event.payload)
        ? (event.payload as Record<string, unknown>)
        : {};

    const category = mapRawEventCategory(event.eventType);
    let level: TerminalLevel = "neutral";
    let message = `${event.deviceId ?? "unknown"} event received.`;
    let badge: string | undefined;

    if (event.eventType === RawEventType.telemetry) {
      const result = buildTelemetryMessage(event.deviceId, payload);
      level = result.level;
      message = result.message;
      badge = result.badge ?? undefined;
    } else if (event.eventType === RawEventType.heartbeat) {
      const result = buildHeartbeatMessage(event.deviceId, payload);
      level = result.level;
      message = result.message;
      badge = result.badge ?? undefined;
    } else if (event.eventType === RawEventType.scan) {
      const result = buildScanMessage(event.deviceId, payload, unknownEventIds);
      level = result.level;
      message = result.message;
      badge = result.badge ?? undefined;
    }

    if (event.retain) {
      badge = badge ?? "RETAIN";
    }

    return {
      id: event.id,
      timestamp: formatClock(event.ingestedAt),
      category,
      level,
      message,
      deviceId: event.deviceId ?? "unknown",
      badge,
    };
  });
}

async function getRealtimePackageEvents(): Promise<RealtimePackageEvent[]> {
  const events = await prisma.packageEvent.findMany({
    include: {
      package: true,
      device: true,
      facility: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: MAX_PACKAGE_EVENTS,
  });

  return events.map((event) => ({
    eventId: event.eventId,
    trackingId: event.package.trackingId,
    status: event.status,
    scanContext: event.scanContext,
    deviceId: event.device?.deviceId ?? null,
    facilityCode: event.facility?.facilityCode ?? null,
    locationName: event.locationName,
    lat: decimalToNumber(event.lat),
    lng: decimalToNumber(event.lng),
    timestampUtc: event.timestampUtc.toISOString(),
  }));
}

async function getSimconDevices(): Promise<Device[]> {
  const [devices, recentEventCounts] = await Promise.all([
    prisma.device.findMany({
      include: {
        facility: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.rawMqttEvent.groupBy({
      by: ["deviceId"],
      where: {
        deviceId: { not: null },
        ingestedAt: {
          gte: new Date(Date.now() - RECENT_THROUGHPUT_WINDOW_MS),
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const recentEventMap = new Map(
    recentEventCounts.map((count) => [count.deviceId ?? "unknown", count._count._all]),
  );

  return devices.map((device) => {
    const throughputCount = recentEventMap.get(device.deviceId) ?? 0;
    const lastBeatSource = device.lastHeartbeatAt ?? device.lastSeenAt ?? device.lastTelemetryAt;

    return {
      id: device.deviceId,
      status:
        device.status === "online" && device.gpsFix === false
          ? "warning"
          : device.status,
      type: device.deviceType,
      role: normalizeRole(device.deviceRole, device.deviceType),
      facility: device.facility?.facilityCode ?? "unassigned",
      zone: device.locationName ?? device.facility?.locationName ?? "Unassigned zone",
      hasGps: device.deviceType === "mobile",
      throughput: `${throughputCount} evt/5m`,
      lastBeat: formatRelativeTime(lastBeatSource),
      battery:
        device.deviceType === "fixed" && device.batteryPct === null
          ? "wired"
          : `${device.batteryPct ?? "--"}%`,
      connectionStatus: mapConnectionStatus(device.status, device.gpsFix),
      scanCooldown: 30,
    };
  });
}

export async function getRealtimeWatermarks(): Promise<RealtimeWatermarks> {
  const [latestDevice, latestRawEvent, latestPackageEvent] = await Promise.all([
    prisma.device.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.rawMqttEvent.findFirst({
      orderBy: { ingestedAt: "desc" },
      select: { ingestedAt: true },
    }),
    prisma.packageEvent.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return {
    deviceUpdatedAt: latestDevice?.updatedAt.toISOString() ?? null,
    rawEventIngestedAt: latestRawEvent?.ingestedAt.toISOString() ?? null,
    packageEventCreatedAt: latestPackageEvent?.createdAt.toISOString() ?? null,
  };
}

export async function getRealtimeSnapshot(): Promise<RealtimeSnapshot> {
  const [devices, terminalEntries, packageEvents, watermarks] = await Promise.all([
    getSimconDevices(),
    getTerminalEntries(),
    getRealtimePackageEvents(),
    getRealtimeWatermarks(),
  ]);

  return {
    devices,
    terminalEntries,
    packageEvents,
    watermarks,
    emittedAt: new Date().toISOString(),
  };
}

export function hasWatermarkChanges(
  previous: RealtimeWatermarks,
  next: RealtimeWatermarks,
) {
  return (
    previous.deviceUpdatedAt !== next.deviceUpdatedAt ||
    previous.rawEventIngestedAt !== next.rawEventIngestedAt ||
    previous.packageEventCreatedAt !== next.packageEventCreatedAt
  );
}

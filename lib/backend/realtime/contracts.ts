import type { Device, TerminalEntry } from "@/lib/simcon/types";

export type RealtimePackageEvent = {
  eventId: string;
  trackingId: string;
  status: string | null;
  scanContext: string | null;
  deviceId: string | null;
  facilityCode: string | null;
  locationName: string | null;
  lat: number | null;
  lng: number | null;
  timestampUtc: string;
};

export type RealtimeWatermarks = {
  deviceUpdatedAt: string | null;
  rawEventIngestedAt: string | null;
  packageEventCreatedAt: string | null;
};

export type RealtimeSnapshot = {
  devices: Device[];
  terminalEntries: TerminalEntry[];
  packageEvents: RealtimePackageEvent[];
  watermarks: RealtimeWatermarks;
  emittedAt: string;
};

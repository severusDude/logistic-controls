export type DeviceStatus = "online" | "warning" | "offline" | "idle";

export type DeviceRole = "truck" | "scanner" | "gateway";

export type DeviceType = "mobile" | "fixed";

export type ConnectionStatus =
  | "connected"
  | "offline"
  | "rebuilding"
  | "degraded";

export type NavItem = {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  active?: boolean;
};

export type Device = {
  id: string;
  status: DeviceStatus;
  type: DeviceType;
  role: DeviceRole;
  facility: string;
  zone: string;
  hasGps: boolean;
  throughput: string;
  lastBeat: string;
  battery: string;
  connectionStatus: ConnectionStatus;
  scanCooldown: number;
};

export type TerminalLevel =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export type TerminalCategory = "HEARTBEAT" | "TELEMETRY" | "SCAN_EVT" | "SYS";

export type TerminalEntry = {
  id: string;
  timestamp: string;
  category: TerminalCategory;
  level: TerminalLevel;
  message: string;
  deviceId: string;
  badge?: string;
};

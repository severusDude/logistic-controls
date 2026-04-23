import { z } from "zod";
import { schemaVersionLiteral, timestampString } from "./shared";

export const heartbeatPayloadSchema = z.object({
  schema_version: schemaVersionLiteral,
  device_id: z.string().min(1),
  device_type: z.literal("mobile"),
  device_role: z.string().min(1),
  facility_id: z.string().min(1),
  timestamp_utc: timestampString,
  uptime_sec: z.number().int().optional(),
  status: z.string().min(1),
  rfid_reader_status: z.string().optional(),
  gps_fix: z.boolean().optional(),
  packages_scanned_today: z.number().int().optional(),
  wifi_rssi: z.number().int().optional(),
});

export type HeartbeatPayload = z.infer<typeof heartbeatPayloadSchema>;

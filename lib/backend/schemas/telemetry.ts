import { z } from "zod";
import { latLngSchema, schemaVersionLiteral, timestampString } from "./shared";

export const telemetryPayloadSchema = z.object({
  schema_version: schemaVersionLiteral,
  device_id: z.string().min(1),
  device_type: z.literal("mobile"),
  facility_id: z.string().min(1),
  timestamp_utc: timestampString,
  sequence_no: z.number().int(),
  gps: latLngSchema.extend({
    altitude_m: z.number().optional(),
    accuracy_m: z.number().optional(),
    heading_deg: z.number().optional(),
    speed_kmh: z.number().optional(),
  }),
  active_package_count: z.number().int().optional(),
  battery_pct: z.number().int().min(0).max(100).optional(),
  signal_strength: z.string().optional(),
  gps_fix: z.boolean(),
});

export type TelemetryPayload = z.infer<typeof telemetryPayloadSchema>;

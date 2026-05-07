import { z } from "zod";
import { latLngSchema, schemaVersionLiteral, timestampString } from "./shared";

export const scanPayloadSchema = z.object({
  schema_version: schemaVersionLiteral,
  event_id: z.string().min(1),
  device_id: z.string().min(1),
  device_type: z.literal("mobile"),
  device_role: z.string().min(1),
  facility_id: z.string().min(1),
  location_name: z.string().min(1),
  timestamp_utc: timestampString,
  rfid_epc: z.string().min(1),
  scan_context: z.enum(["pickup", "in_transit"]),
  signal_strength_dbm: z.number().optional(),
  read_count: z.number().int().optional(),
  device_gps: latLngSchema.optional(),
});

export type ScanPayload = z.infer<typeof scanPayloadSchema>;

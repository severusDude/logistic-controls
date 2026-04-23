import { z } from "zod";

export const commandPayloadSchema = z.object({
  command: z.enum(["update_role", "force_scan", "set_cooldown", "reboot"]),
  command_id: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export type CommandPayload = z.infer<typeof commandPayloadSchema>;

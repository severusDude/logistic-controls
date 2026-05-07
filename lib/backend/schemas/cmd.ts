import { z } from "zod";

export const deviceCommandSchema = z.enum([
  "update_role",
  "force_scan",
  "set_cooldown",
  "reboot",
]);

export const commandRouteSegmentSchema = z.enum([
  "update-role",
  "force-scan",
  "set-cooldown",
  "reboot",
]);

export const mqttCommandEnvelopeSchema = z.object({
  command: deviceCommandSchema,
  command_id: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

const nonEmptyString = z.string().trim().min(1);

export const updateRoleCommandApiSchema = z
  .object({
    newRole: nonEmptyString.optional(),
    new_role: nonEmptyString.optional(),
    newFacilityId: nonEmptyString.optional(),
    new_facility_id: nonEmptyString.optional(),
    newLocationName: nonEmptyString.optional(),
    new_location_name: nonEmptyString.optional(),
  })
  .strict()
  .transform((value, ctx) => {
    const newRole = value.new_role ?? value.newRole;
    const newFacilityId = value.new_facility_id ?? value.newFacilityId;
    const newLocationName = value.new_location_name ?? value.newLocationName;

    if (!newRole) {
      ctx.addIssue({
        code: "custom",
        path: ["newRole"],
        message: "newRole is required",
      });
    }

    if (!newFacilityId) {
      ctx.addIssue({
        code: "custom",
        path: ["newFacilityId"],
        message: "newFacilityId is required",
      });
    }

    if (!newLocationName) {
      ctx.addIssue({
        code: "custom",
        path: ["newLocationName"],
        message: "newLocationName is required",
      });
    }

    if (!newRole || !newFacilityId || !newLocationName) {
      return z.NEVER;
    }

    return {
      new_role: newRole,
      new_facility_id: newFacilityId,
      new_location_name: newLocationName,
    };
  });

export const setCooldownCommandApiSchema = z
  .object({
    scanCooldown: z.coerce.number().int().min(1).max(999).optional(),
    cooldownSec: z.coerce.number().int().min(1).max(999).optional(),
    cooldown_sec: z.coerce.number().int().min(1).max(999).optional(),
  })
  .strict()
  .transform((value, ctx) => {
    const cooldownSec =
      value.cooldown_sec ?? value.cooldownSec ?? value.scanCooldown;

    if (!cooldownSec) {
      ctx.addIssue({
        code: "custom",
        path: ["scanCooldown"],
        message: "scanCooldown is required",
      });

      return z.NEVER;
    }

    return {
      cooldown_sec: cooldownSec,
    };
  });

const emptyCommandApiSchema = z.object({}).strict();

export const commandRouteConfig = {
  "update-role": {
    command: "update_role",
    bodySchema: updateRoleCommandApiSchema,
  },
  "force-scan": {
    command: "force_scan",
    bodySchema: emptyCommandApiSchema,
  },
  "set-cooldown": {
    command: "set_cooldown",
    bodySchema: setCooldownCommandApiSchema,
  },
  reboot: {
    command: "reboot",
    bodySchema: emptyCommandApiSchema,
  },
} as const satisfies Record<
  z.infer<typeof commandRouteSegmentSchema>,
  {
    command: z.infer<typeof deviceCommandSchema>;
    bodySchema: z.ZodType<Record<string, unknown>>;
  }
>;

export type DeviceCommand = z.infer<typeof deviceCommandSchema>;
export type CommandRouteSegment = z.infer<typeof commandRouteSegmentSchema>;
export type MqttCommandEnvelope = z.infer<typeof mqttCommandEnvelopeSchema>;
export type UpdateRoleCommandInput = z.input<typeof updateRoleCommandApiSchema>;
export type SetCooldownCommandInput = z.input<typeof setCooldownCommandApiSchema>;

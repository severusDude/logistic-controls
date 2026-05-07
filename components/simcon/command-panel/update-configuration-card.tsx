"use client";

import { Boxes } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Device, DeviceRole } from "@/lib/simcon/types";
import { Button } from "@/components/ui/button";
import { InlineNote } from "@/components/ui/inline-note";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommandCard } from "@/components/simcon/command-panel/command-card";
import { MonoLabel } from "@/components/ui/mono-label";
import {
  CommandClientError,
  submitDeviceCommand,
} from "@/lib/backend/commands/command-client";
import {
  updateRoleCommandApiSchema,
  type UpdateRoleCommandInput,
} from "@/lib/backend/schemas/cmd";

const roles: DeviceRole[] = ["truck", "scanner", "gateway"];

type UpdateConfigurationCardProps = {
  device: Device;
  canSendCommands: boolean;
};

export function UpdateConfigurationCard({
  device,
  canSendCommands,
}: UpdateConfigurationCardProps) {
  const form = useForm<UpdateRoleCommandInput>({
    resolver: zodResolver(updateRoleCommandApiSchema),
    defaultValues: {
      newRole: device.role,
      newFacilityId: device.facility,
      newLocationName: device.zone,
    },
  });
  const isBusy = form.formState.isSubmitting;

  const handleSubmit = async (values: UpdateRoleCommandInput) => {
    try {
      await submitDeviceCommand(device.id, "update-role", values);
      form.reset({
        newRole: values.newRole ?? values.new_role ?? device.role,
        newFacilityId: values.newFacilityId ?? values.new_facility_id ?? device.facility,
        newLocationName:
          values.newLocationName ?? values.new_location_name ?? device.zone,
      });
    } catch (error) {
      if (error instanceof CommandClientError) {
        form.setError("root", {
          message: error.message,
        });
        return;
      }

      form.setError("root", {
        message: "Unexpected command failure",
      });
    }
  };

  return (
    <CommandCard
      title="Configuration uplink"
      tone="primary"
      icon={<Boxes className="size-5 text-sky-100" />}
    >
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <InlineNote tone={canSendCommands ? "info" : "warning"}>
          {canSendCommands
            ? "Backend publish active. Command posts go through `/api/devices/:deviceId/commands/:command`."
            : "Fixed device. Backend command publish disabled until mobile device selected."}
        </InlineNote>
        <div className="grid gap-3 md:grid-cols-3">
          <InfoBlock label="Role" value={device.role} />
          <InfoBlock label="Facility" value={device.facility} />
          <InfoBlock label="Zone" value={device.zone} />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-2">
            <Label className="text-[var(--ink-soft)]">Role profile</Label>
            <Controller
              control={form.control}
              name="newRole"
              render={({ field }) => (
                <Select
                  disabled={isBusy || !canSendCommands}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg border-[var(--line-subtle)] bg-black/10 text-white shadow-none">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[var(--bg-panel-strong)] text-white">
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.newRole ? (
              <p className="text-xs text-rose-200">{form.formState.errors.newRole.message}</p>
            ) : null}
          </div>
          <Field
            error={form.formState.errors.newFacilityId?.message}
            label="Facility ID"
          >
            <Input
              {...form.register("newFacilityId")}
              disabled={isBusy || !canSendCommands}
              className="h-10 rounded-lg border-[var(--line-subtle)] bg-black/10 text-white shadow-none"
            />
          </Field>
          <Field
            error={form.formState.errors.newLocationName?.message}
            label="Location name"
          >
            <Input
              {...form.register("newLocationName")}
              disabled={isBusy || !canSendCommands}
              className="h-10 rounded-lg border-[var(--line-subtle)] bg-black/10 text-white shadow-none"
            />
          </Field>
        </div>
        {form.formState.errors.root?.message ? (
          <InlineNote tone="error">{form.formState.errors.root.message}</InlineNote>
        ) : null}
        <Button
          type="submit"
          disabled={isBusy || !canSendCommands}
          className="h-10 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-sky-400/90"
        >
          Push updated config
        </Button>
      </form>
    </CommandCard>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-[var(--ink-soft)]">{label}</Label>
      {children}
      {error ? <p className="text-xs text-rose-200">{error}</p> : null}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line-subtle)] bg-black/10 p-3">
      <MonoLabel>{label}</MonoLabel>
      <p className="mt-1 text-sm font-medium text-[var(--ink-soft)]">{value}</p>
    </div>
  );
}

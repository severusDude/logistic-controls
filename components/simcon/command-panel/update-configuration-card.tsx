"use client";

import { Boxes } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Device, DeviceRole } from "@/lib/simcon/types";
import { Button } from "@/components/ui/button";
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

const updateConfigurationSchema = z.object({
  role: z.enum(["truck", "scanner", "gateway"]),
  facilityId: z.string().min(1, "Facility required"),
  locationZone: z.string().min(1, "Zone required"),
});

type UpdateConfigurationValues = z.infer<typeof updateConfigurationSchema>;

const roles: DeviceRole[] = ["truck", "scanner", "gateway"];

export function UpdateConfigurationCard({ device }: { device: Device }) {
  const form = useForm<UpdateConfigurationValues>({
    defaultValues: {
      role: device.role,
      facilityId: device.facility,
      locationZone: device.zone,
    },
  });

  const handleSubmit = (values: UpdateConfigurationValues) => {
    form.clearErrors();
    const result = updateConfigurationSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          form.setError(field as keyof UpdateConfigurationValues, {
            message: issue.message,
          });
        }
      }
      return;
    }

    form.reset(result.data);
  };

  return (
    <CommandCard
      title="Configuration uplink"
      accentClassName="h-1.5 w-full bg-gradient-to-r from-sky-300/80 to-cyan-300/20"
      icon={<Boxes className="size-5 text-sky-100" />}
    >
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
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
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 w-full rounded-2xl border-white/10 bg-black/10 text-white shadow-none">
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
            {form.formState.errors.role ? (
              <p className="text-xs text-rose-200">{form.formState.errors.role.message}</p>
            ) : null}
          </div>
          <Field
            error={form.formState.errors.facilityId?.message}
            label="Facility ID"
          >
            <Input
              {...form.register("facilityId")}
              className="h-11 rounded-2xl border-white/10 bg-black/10 text-white shadow-none"
            />
          </Field>
          <Field
            error={form.formState.errors.locationZone?.message}
            label="Location ring"
          >
            <Input
              {...form.register("locationZone")}
              className="h-11 rounded-2xl border-white/10 bg-black/10 text-white shadow-none"
            />
          </Field>
        </div>
        <Button className="h-11 rounded-2xl bg-sky-300/12 text-sky-50 hover:bg-sky-300/20">
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
    <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
      <MonoLabel className="text-[10px] tracking-[0.24em]">{label}</MonoLabel>
      <p className="mt-2 text-sm font-medium text-[var(--ink-soft)]">{value}</p>
    </div>
  );
}

"use client";

import { Activity } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Device } from "@/lib/simcon/types";
import { CommandCard } from "@/components/simcon/command-panel/command-card";
import { Button } from "@/components/ui/button";
import { InlineNote } from "@/components/ui/inline-note";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonoLabel } from "@/components/ui/mono-label";
import {
  CommandClientError,
  submitDeviceCommand,
} from "@/lib/backend/commands/command-client";
import {
  setCooldownCommandApiSchema,
  type SetCooldownCommandInput,
} from "@/lib/backend/schemas/cmd";

type TimingParamsCardProps = {
  device: Device;
  canSendCommands: boolean;
};

export function TimingParamsCard({
  device,
  canSendCommands,
}: TimingParamsCardProps) {
  const form = useForm<SetCooldownCommandInput>({
    resolver: zodResolver(setCooldownCommandApiSchema),
    defaultValues: { scanCooldown: device.scanCooldown },
  });
  const isBusy = form.formState.isSubmitting;

  const handleSubmit = async (values: SetCooldownCommandInput) => {
    try {
      await submitDeviceCommand(device.id, "set-cooldown", values);
      form.reset({
        scanCooldown:
          typeof values.scanCooldown === "number"
            ? values.scanCooldown
            : typeof values.cooldown_sec === "number"
              ? values.cooldown_sec
              : typeof values.cooldownSec === "number"
                ? values.cooldownSec
                : device.scanCooldown,
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
      title="Timing parameters"
      tone="secondary"
      icon={<Activity className="size-5 text-emerald-100" />}
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <InlineNote tone={canSendCommands ? "info" : "warning"}>
          {canSendCommands
            ? "Cooldown updates use shared schema and publish to device MQTT cmd topic."
            : "Fixed device. Timing publish disabled until mobile device selected."}
        </InlineNote>
        <div className="grid gap-3 md:grid-cols-3">
          <InfoBlock label="Cooldown" value={`${device.scanCooldown}s`} />
          <InfoBlock label="Battery" value={device.battery} />
          <InfoBlock label="Heartbeat" value={device.lastBeat} />
        </div>
        <div className="grid gap-2">
          <Label className="text-[var(--ink-soft)]">Scan cooldown seconds</Label>
          <Input
            {...form.register("scanCooldown", { valueAsNumber: true })}
            disabled={isBusy || !canSendCommands}
            min={1}
            max={999}
            step={1}
            type="number"
            className="h-10 rounded-lg border-[var(--line-subtle)] bg-black/10 text-white shadow-none"
          />
          {form.formState.errors.scanCooldown ? (
            <p className="text-xs text-rose-200">
              {form.formState.errors.scanCooldown.message}
            </p>
          ) : null}
        </div>
        {form.formState.errors.root?.message ? (
          <InlineNote tone="error">{form.formState.errors.root.message}</InlineNote>
        ) : null}
        <InlineNote tone="success">
          Cooldown rail clamps duplicate scan bursts during lane congestion and mesh retries.
        </InlineNote>
        <Button
          type="submit"
          disabled={isBusy || !canSendCommands}
          className="h-10 rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:brightness-110"
        >
          Sync timing window
        </Button>
      </form>
    </CommandCard>
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

"use client";

import { Activity } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Device } from "@/lib/simcon/types";
import { CommandCard } from "@/components/simcon/command-panel/command-card";
import { Button } from "@/components/ui/button";
import { InlineNote } from "@/components/ui/inline-note";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonoLabel } from "@/components/ui/mono-label";

const timingParamsSchema = z.object({
  scanCooldown: z.number().min(1).max(999),
});

type TimingParamsValues = z.infer<typeof timingParamsSchema>;

export function TimingParamsCard({ device }: { device: Device }) {
  const form = useForm<TimingParamsValues>({
    defaultValues: { scanCooldown: device.scanCooldown },
  });

  const handleSubmit = (values: TimingParamsValues) => {
    form.clearErrors();
    const result = timingParamsSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          form.setError(field as keyof TimingParamsValues, {
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
      title="Timing parameters"
      accentClassName="h-1.5 w-full bg-gradient-to-r from-emerald-300/80 to-teal-300/20"
      icon={<Activity className="size-5 text-emerald-100" />}
    >
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <InfoBlock label="Cooldown" value={`${device.scanCooldown}s`} />
          <InfoBlock label="Battery" value={device.battery} />
          <InfoBlock label="Heartbeat" value={device.lastBeat} />
        </div>
        <div className="grid gap-2">
          <Label className="text-[var(--ink-soft)]">Scan cooldown seconds</Label>
          <Input
            type="number"
            {...form.register("scanCooldown", { valueAsNumber: true })}
            className="h-11 rounded-2xl border-white/10 bg-black/10 text-white shadow-none"
          />
          {form.formState.errors.scanCooldown ? (
            <p className="text-xs text-rose-200">
              {form.formState.errors.scanCooldown.message}
            </p>
          ) : null}
        </div>
        <InlineNote tone="success">
          Cooldown rail clamps duplicate scan bursts during lane congestion and mesh retries.
        </InlineNote>
        <Button className="h-11 rounded-2xl bg-emerald-300/12 text-emerald-50 hover:bg-emerald-300/20">
          Sync timing window
        </Button>
      </form>
    </CommandCard>
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

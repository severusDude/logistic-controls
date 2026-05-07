"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import type { Device } from "@/lib/simcon/types";
import { CommandCard } from "@/components/simcon/command-panel/command-card";
import { Button } from "@/components/ui/button";
import { InlineNote } from "@/components/ui/inline-note";
import {
  CommandClientError,
  submitDeviceCommand,
} from "@/lib/backend/commands/command-client";

type ImmediateExecutionCardProps = {
  device: Device;
  canSendCommands: boolean;
};

type CommandState = {
  tone: "info" | "success" | "warning" | "error";
  message: string;
};

export function ImmediateExecutionCard({
  device,
  canSendCommands,
}: ImmediateExecutionCardProps) {
  const [forceScanState, setForceScanState] = useState<CommandState | null>(null);
  const [rebootState, setRebootState] = useState<CommandState | null>(null);
  const [confirmingReboot, setConfirmingReboot] = useState(false);
  const [activeCommand, setActiveCommand] = useState<"force-scan" | "reboot" | null>(null);

  const isBusy = activeCommand !== null;

  const publishCommand = async (command: "force-scan" | "reboot") => {
    setActiveCommand(command);

    try {
      const result = await submitDeviceCommand(device.id, command, {});
      const message = `Published ${result.commandId} to ${result.topic}`;

      if (command === "force-scan") {
        setForceScanState({ tone: "success", message });
      } else {
        setRebootState({ tone: "success", message });
      }
      setConfirmingReboot(false);
    } catch (error) {
      const message =
        error instanceof CommandClientError
          ? error.message
          : "Unexpected command failure";

      if (command === "force-scan") {
        setForceScanState({ tone: "error", message });
      } else {
        setRebootState({ tone: "error", message });
      }
    } finally {
      setActiveCommand(null);
    }
  };

  return (
    <CommandCard
      title="Immediate execution"
      tone="tertiary"
      icon={<Zap className="size-5 text-amber-100" />}
    >
      <div className="grid gap-4">
        <InlineNote tone={canSendCommands ? "info" : "warning"}>
          {canSendCommands
            ? "Fast commands publish straight to device MQTT cmd topic."
            : "Fixed device. Immediate commands disabled until mobile device selected."}
        </InlineNote>

        <div className="grid gap-3 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            disabled={isBusy || !canSendCommands}
            onClick={() => {
              void publishCommand("force-scan");
            }}
            className="h-auto rounded-lg border-[--line-subtle] bg-transparent px-3 py-3 text-left text-white hover:border-[--line-accent] hover:bg-[rgba(56,189,248,0.08)]"
          >
            <p className="font-semibold">Force scan</p>
          </Button>

          {confirmingReboot ? (
            <div className="grid gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={isBusy || !canSendCommands}
                onClick={() => {
                  void publishCommand("reboot");
                }}
                className="h-auto rounded-lg border border-rose-400/30 bg-transparent px-3 py-3 text-left text-rose-50 hover:bg-rose-400/18"
              >
                <p className="font-semibold">Confirm reboot</p>
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => setConfirmingReboot(false)}
                className="h-auto rounded-lg border-[--line-subtle] bg-transparent px-3 py-2 text-white hover:border-[--line-accent] hover:bg-[rgba(255,255,255,0.05)]"
              >
                <p className="font-semibold">Cancel</p>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              disabled={isBusy || !canSendCommands}
              onClick={() => setConfirmingReboot(true)}
              className="h-auto rounded-lg border border-rose-400/30 bg-transparent px-3 py-3 text-left text-rose-50 hover:bg-rose-400/18"
            >
              <p className="font-semibold">Reboot sequence</p>
            </Button>
          )}
        </div>

        {forceScanState ? (
          <InlineNote tone={forceScanState.tone}>{forceScanState.message}</InlineNote>
        ) : null}
        {rebootState ? (
          <InlineNote tone={rebootState.tone}>{rebootState.message}</InlineNote>
        ) : null}
        <InlineNote tone="warning">
          Reboot stays two-step. Backend route only sends after explicit confirm.
        </InlineNote>
      </div>
    </CommandCard>
  );
}

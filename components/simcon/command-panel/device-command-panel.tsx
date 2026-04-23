import type { Device } from "@/lib/simcon/types";
import { PanelHeader } from "@/components/layout/panel-header";
import { Separator } from "@/components/ui/separator";
import { SectionCard } from "@/components/ui/section-card";
import { ConnectionBadge } from "@/components/simcon/command-panel/connection-badge";
import { ImmediateExecutionCard } from "@/components/simcon/command-panel/immediate-execution-card";
import { TimingParamsCard } from "@/components/simcon/command-panel/timing-params-card";
import { UpdateConfigurationCard } from "@/components/simcon/command-panel/update-configuration-card";

export function DeviceCommandPanel({ device }: { device: Device }) {
  return (
    <SectionCard
      className="min-h-[420px] bg-[var(--bg-panel-strong)]"
      contentClassName="flex h-full flex-col gap-4"
    >
      <PanelHeader
        eyebrow="Command deck"
        title={device.id}
        description={`${device.facility} / ${device.zone}`}
        action={<ConnectionBadge status={device.connectionStatus} />}
      />
      <Separator className="bg-white/10" />
      <div className="grid gap-4">
        <UpdateConfigurationCard device={device} />
        <TimingParamsCard device={device} />
        <ImmediateExecutionCard />
      </div>
    </SectionCard>
  );
}

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
      className="min-h-0 bg-[var(--bg-panel-strong)]"
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      <div className="shrink-0">
        <PanelHeader
          title={device.id}
          description={`${device.facility} / ${device.zone}`}
          action={<ConnectionBadge status={device.connectionStatus} />}
        />
        <Separator className="mt-3 bg-white/10" />
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-auto pr-1">
        <div className="grid gap-3">
          <UpdateConfigurationCard device={device} />
          <TimingParamsCard device={device} />
          <ImmediateExecutionCard />
        </div>
      </div>
    </SectionCard>
  );
}

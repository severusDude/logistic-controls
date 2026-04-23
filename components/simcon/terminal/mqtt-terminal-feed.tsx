import { SectionCard } from "@/components/ui/section-card";
import type { TerminalEntry } from "@/lib/simcon/types";
import { TerminalLogList } from "@/components/simcon/terminal/terminal-log-list";
import { TerminalToolbar } from "@/components/simcon/terminal/terminal-toolbar";

export function MqttTerminalFeed({
  entries,
  paused,
  showOnlySelected,
  onTogglePaused,
}: {
  entries: TerminalEntry[];
  paused: boolean;
  showOnlySelected: boolean;
  onTogglePaused: () => void;
}) {
  return (
    <SectionCard
      className="min-h-[280px] bg-[#02070d]"
      contentClassName="flex h-full flex-col px-0 pb-0"
    >
      <TerminalToolbar
        paused={paused}
        showOnlySelected={showOnlySelected}
        onTogglePaused={onTogglePaused}
      />
      <TerminalLogList entries={entries} />
    </SectionCard>
  );
}

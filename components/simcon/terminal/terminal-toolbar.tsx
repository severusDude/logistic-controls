import { PauseCircle, PlayCircle, RadioTower } from "lucide-react";
import { PanelHeader } from "@/components/layout/panel-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TerminalToolbar({
  paused,
  showOnlySelected,
  onTogglePaused,
}: {
  paused: boolean;
  showOnlySelected: boolean;
  onTogglePaused: () => void;
}) {
  return (
    <div className="border-b border-white/10 px-4 py-4">
      <PanelHeader
        eyebrow="MQTT terminal"
        title="Event stream"
        description="mesh://fleet-control/mqtt/site/java"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              <RadioTower className="mr-1 size-3" />
              {showOnlySelected ? "selection scoped" : "all assets"}
            </Badge>
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={onTogglePaused}
            >
              {paused ? <PlayCircle /> : <PauseCircle />}
              {paused ? "Resume feed" : "Pause feed"}
            </Button>
          </div>
        }
      />
    </div>
  );
}

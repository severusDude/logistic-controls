import type { TerminalEntry } from "@/lib/simcon/types";
import { TerminalLogLine } from "@/components/simcon/terminal/terminal-log-line";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TerminalLogList({ entries }: { entries: TerminalEntry[] }) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="px-3 py-3 font-mono text-[13px]">
        {entries.map((entry) => (
          <TerminalLogLine key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  );
}

import type { TerminalEntry } from "@/lib/simcon/types";
import { TerminalLogLine } from "@/components/simcon/terminal/terminal-log-line";

export function TerminalLogList({ entries }: { entries: TerminalEntry[] }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto px-3 py-3 font-mono text-[13px]">
      {entries.map((entry) => (
        <TerminalLogLine key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

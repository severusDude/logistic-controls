import { Badge } from "@/components/ui/badge";
import { NumericText } from "@/components/ui/numeric-text";
import { StatusDot } from "@/components/ui/status-dot";
import type { TerminalEntry, TerminalLevel } from "@/lib/simcon/types";

const levelText: Record<TerminalLevel, string> = {
  neutral: "text-slate-300",
  info: "text-sky-200",
  success: "text-emerald-200",
  warning: "text-amber-200",
  error: "text-rose-200",
};

const dotStatus: Record<TerminalLevel, "idle" | "online" | "warning" | "offline"> = {
  neutral: "idle",
  info: "online",
  success: "online",
  warning: "warning",
  error: "offline",
};

export function TerminalLogLine({ entry }: { entry: TerminalEntry }) {
  return (
    <div className="grid gap-3 border-b border-white/6 py-2.5 md:grid-cols-[140px_110px_1fr]">
      <NumericText className="text-[var(--ink-muted)]">{entry.timestamp}</NumericText>
      <div className="flex items-center gap-2">
        <StatusDot status={dotStatus[entry.level]} size="sm" />
        <span className={levelText[entry.level]}>{entry.category}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sky-100">{entry.deviceId}</span>
        <span className="text-[var(--ink-soft)]">{entry.message}</span>
        {entry.badge ? (
          <Badge className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-white">
            {entry.badge}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

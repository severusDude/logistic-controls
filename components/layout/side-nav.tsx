import { ShieldAlert } from "lucide-react";
import type { NavItem } from "@/lib/simcon/types";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { cn } from "@/lib/utils";

export function SideNav({ navItems }: { navItems: NavItem[] }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[var(--line-subtle)] bg-[var(--bg-panel)] p-4 lg:w-[290px] lg:border-r lg:border-b-0">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <MonoLabel>Control cluster</MonoLabel>
        <h2 className="mt-2 text-lg font-semibold text-white">Java Freight Mesh</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          Precision board for dock scanners, mobile trucks, and site gateways.
        </p>
      </div>
      <nav className="mt-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3 py-3 transition",
              item.active
                ? "border-sky-300/30 bg-sky-300/10 text-white"
                : "border-white/6 bg-white/[0.02] text-[var(--ink-soft)] hover:border-white/14 hover:bg-white/[0.05]",
            )}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-mono text-[11px] tracking-[0.16em]">
              {item.shortLabel}
            </span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-[24px] border border-white/10 bg-[#02070d] p-4">
        <div className="flex items-center gap-2 text-amber-100">
          <ShieldAlert className="size-4" />
          <MonoLabel className="text-amber-100">Safety rail</MonoLabel>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          Escalations require dual operator acknowledgment before restart.
        </p>
        <Button
          variant="outline"
          className="mt-4 h-11 w-full rounded-2xl border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/18"
        >
          Arm maintenance window
        </Button>
      </div>
    </aside>
  );
}

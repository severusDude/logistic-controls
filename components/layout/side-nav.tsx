import { ShieldAlert } from "lucide-react";
import type { NavItem } from "@/lib/simcon/types";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function SideNav({ navItems }: { navItems: NavItem[] }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[var(--line-subtle)] bg-[var(--bg-panel)] p-3 lg:h-full lg:w-[284px] lg:border-r lg:border-b-0">
      <ScrollArea className="min-h-0 flex-1 lg:min-h-0">
        <div className="flex flex-col gap-4 pr-3">
          <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] p-3">
            <MonoLabel>Control cluster</MonoLabel>
            <h2 className="mt-2 text-lg font-semibold text-white">Java Freight Mesh</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Precision board for dock scanners, mobile trucks, and site gateways.
            </p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition",
                  item.active
                    ? "border-sky-300/30 bg-sky-300/10 text-white"
                    : "border-[var(--line-subtle)] bg-transparent text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:bg-[var(--bg-panel-soft)]",
                )}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line-subtle)] bg-black/10 font-mono text-[11px] tracking-[0.05em]">
                  {item.shortLabel}
                </span>
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="rounded-xl border border-[var(--line-subtle)] bg-[#02070d] p-3">
            <div className="flex items-center gap-2 text-amber-100">
              <ShieldAlert className="size-4" />
              <MonoLabel className="text-amber-100">Safety rail</MonoLabel>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Escalations require dual operator acknowledgment before restart.
            </p>
            <Button
              variant="outline"
              className="mt-4 h-10 w-full rounded-lg border-amber-300/30 bg-transparent text-amber-100 hover:bg-amber-300/18"
            >
              Arm maintenance window
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

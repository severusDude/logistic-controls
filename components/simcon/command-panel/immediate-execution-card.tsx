import { Zap } from "lucide-react";
import { CommandCard } from "@/components/simcon/command-panel/command-card";
import { Button } from "@/components/ui/button";

export function ImmediateExecutionCard() {
  return (
    <CommandCard
      title="Immediate execution"
      accentClassName="h-1.5 w-full bg-gradient-to-r from-amber-200/80 to-rose-300/20"
      icon={<Zap className="size-5 text-amber-100" />}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Button
          variant="outline"
          className="h-auto rounded-2xl border-white/10 bg-white/6 px-4 py-4 text-left text-white hover:bg-white/10"
        >
          <div>
            <p className="font-semibold">Force scan</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Trigger manual barcode acquisition on next camera frame.
            </p>
          </div>
        </Button>
        <Button
          variant="destructive"
          className="h-auto rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-4 text-left text-rose-50 hover:bg-rose-400/18"
        >
          <div>
            <p className="font-semibold">Reboot sequence</p>
            <p className="mt-2 text-sm leading-6 text-rose-100/80">
              Restart endpoint and request fresh session token from gateway.
            </p>
          </div>
        </Button>
      </div>
    </CommandCard>
  );
}

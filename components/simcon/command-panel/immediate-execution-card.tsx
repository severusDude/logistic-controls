import { Zap } from "lucide-react";
import { CommandCard } from "@/components/simcon/command-panel/command-card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ImmediateExecutionCard() {
  return (
    <CommandCard
      title="Immediate execution"
      tone="tertiary"
      icon={<Zap className="size-5 text-amber-100" />}
    >
      <TooltipProvider>
        <div className="grid gap-3 md:grid-cols-2">
          {/* Force Scan Button */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="outline"
                className="h-auto rounded-lg border-[--line-subtle] bg-transparent px-3 py-3 text-left text-white hover:border-[--line-accent] hover:bg-[rgba(56,189,248,0.08)]"
              >
                <div>
                  <p className="font-semibold">Force scan</p>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px]">
              <p className="text-sm leading-5">
                Trigger manual barcode acquisition on next camera frame.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Reboot Sequence Button */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="destructive"
                className="h-auto rounded-lg border border-rose-400/30 bg-transparent px-3 py-3 text-left text-rose-50 hover:bg-rose-400/18"
              >
                <div>
                  <p className="font-semibold">Reboot sequence</p>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px]">
              <p className="text-sm leading-5">
                Restart endpoint and request fresh session token from gateway.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </CommandCard>
  );
}

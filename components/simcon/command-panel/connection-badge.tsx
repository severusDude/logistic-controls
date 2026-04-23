import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import type { ConnectionStatus } from "@/lib/simcon/types";
import { cn } from "@/lib/utils";

const connectionBadgeVariants = cva(
  "rounded-full border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.05em]",
  {
    variants: {
      status: {
        connected:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
        degraded:
          "border-amber-300/20 bg-amber-300/10 text-amber-100",
        rebuilding:
          "border-sky-300/20 bg-sky-300/10 text-sky-100",
        offline: "border-rose-300/20 bg-rose-300/10 text-rose-100",
      },
    },
  },
);

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return <Badge className={cn(connectionBadgeVariants({ status }))}>{status}</Badge>;
}

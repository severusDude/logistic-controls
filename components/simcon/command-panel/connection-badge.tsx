import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import type { ConnectionStatus } from "@/lib/simcon/types";
import { cn } from "@/lib/utils";

const connectionBadgeVariants = cva(
  "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      status: {
        connected:
          "bg-emerald-400/14 text-emerald-100 ring-1 ring-emerald-400/25",
        degraded:
          "bg-amber-300/14 text-amber-100 ring-1 ring-amber-300/25",
        rebuilding:
          "bg-sky-300/14 text-sky-100 ring-1 ring-sky-300/25",
        offline: "bg-rose-400/14 text-rose-100 ring-1 ring-rose-400/25",
      },
    },
  },
);

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return <Badge className={cn(connectionBadgeVariants({ status }))}>{status}</Badge>;
}

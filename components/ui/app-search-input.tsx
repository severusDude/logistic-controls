"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AppSearchInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div
      className={cn(
        "flex h-11 min-w-[260px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-[var(--ink-soft)]",
        className,
      )}
    >
      <Search className="size-4 text-sky-200" />
      <Input
        className="h-auto border-0 bg-transparent px-0 py-0 text-sm text-white shadow-none focus-visible:ring-0"
        {...props}
      />
    </div>
  );
}

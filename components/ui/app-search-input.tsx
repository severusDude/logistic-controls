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
        "flex h-10 min-w-[260px] items-center gap-2 rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] px-3 text-[var(--ink-soft)]",
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

import { cn } from "@/lib/utils";

export function MonoLabel({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}

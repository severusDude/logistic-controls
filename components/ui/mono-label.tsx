import { cn } from "@/lib/utils";

export function MonoLabel({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-mono text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}

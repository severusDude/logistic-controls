import { cn } from "@/lib/utils";

export function NumericText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "font-mono text-[14px] font-semibold tracking-[0.02em] tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

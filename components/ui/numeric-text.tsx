import { cn } from "@/lib/utils";

export function NumericText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("font-mono text-[13px] tracking-[0.08em]", className)}
      {...props}
    />
  );
}

import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva("", {
  variants: {
    tone: {
      default:
        "border-[var(--line-subtle)] bg-transparent text-[var(--ink-soft)] hover:border-[var(--line-accent)] hover:bg-[color:rgba(56,189,248,0.08)] hover:text-white",
      active:
        "border-[var(--line-accent)] bg-[color:rgba(56,189,248,0.1)] text-sky-50 hover:bg-[color:rgba(56,189,248,0.16)]",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export function IconButton({
  className,
  tone,
  ...props
}: React.ComponentProps<typeof Button> & VariantProps<typeof iconButtonVariants>) {
  return (
    <Button
      size="icon"
      variant="outline"
      className={cn(
        "rounded-lg shadow-none",
        iconButtonVariants({ tone }),
        className,
      )}
      {...props}
    />
  );
}

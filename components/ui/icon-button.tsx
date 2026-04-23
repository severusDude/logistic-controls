import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva("", {
  variants: {
    tone: {
      default:
        "border-white/10 bg-white/5 text-[var(--ink-soft)] hover:bg-white/10 hover:text-white",
      active:
        "border-sky-300/30 bg-sky-300/12 text-sky-50 hover:bg-sky-300/18",
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
        "rounded-2xl shadow-none",
        iconButtonVariants({ tone }),
        className,
      )}
      {...props}
    />
  );
}

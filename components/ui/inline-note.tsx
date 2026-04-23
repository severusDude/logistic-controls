import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inlineNoteVariants = cva(
  "rounded-2xl border p-3 text-sm leading-6",
  {
    variants: {
      tone: {
        info: "border-sky-300/16 bg-sky-300/8 text-sky-50",
        warning: "border-amber-300/16 bg-amber-300/8 text-amber-50",
        error: "border-rose-300/16 bg-rose-300/8 text-rose-50",
        success: "border-emerald-300/16 bg-emerald-300/8 text-emerald-50",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  },
);

export function InlineNote({
  className,
  tone,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inlineNoteVariants>) {
  return <div className={cn(inlineNoteVariants({ tone }), className)} {...props} />;
}

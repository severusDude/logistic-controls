import { MonoLabel } from "@/components/ui/mono-label";
import { cn } from "@/lib/utils";

export function PanelHeader({
  className,
  eyebrow,
  title,
  description,
  action,
}: {
  className?: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div>
        <MonoLabel>{eyebrow}</MonoLabel>
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

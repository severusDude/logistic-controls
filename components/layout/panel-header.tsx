import { MonoLabel } from "@/components/ui/mono-label";
import { cn } from "@/lib/utils";

export function PanelHeader({
  className,
  title,
  description,
  action,
}: {
  className?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div>
        <h2 className="mt-1 text-[20px] leading-7 font-semibold text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

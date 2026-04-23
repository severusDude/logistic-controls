import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SectionCard({
  className,
  contentClassName,
  bodyClassName,
  description,
  title,
  children,
}: {
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  description?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "flex h-full min-h-0 flex-col rounded-xl border border-[var(--line-subtle)] bg-[var(--bg-panel)] py-0 text-white ring-0",
        className,
      )}
    >
      {title || description ? (
        <CardHeader className={cn("px-3 py-3", bodyClassName)}>
          {title ? <CardTitle className="text-white">{title}</CardTitle> : null}
          {description ? (
            <CardDescription className="text-[var(--ink-soft)]">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn("min-h-0 flex-1 px-3 pb-3", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

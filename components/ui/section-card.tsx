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
  description,
  title,
  children,
}: {
  className?: string;
  contentClassName?: string;
  description?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "rounded-[28px] border border-white/10 bg-[var(--bg-panel)] py-0 text-white ring-0",
        className,
      )}
    >
      {title || description ? (
        <CardHeader className="px-4 py-4">
          {title ? <CardTitle className="text-white">{title}</CardTitle> : null}
          {description ? (
            <CardDescription className="text-[var(--ink-soft)]">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn("px-4 pb-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

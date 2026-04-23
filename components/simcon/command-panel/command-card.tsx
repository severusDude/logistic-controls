import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MonoLabel } from "@/components/ui/mono-label";

export function CommandCard({
  title,
  tone,
  icon,
  children,
}: {
  title: string;
  tone: "primary" | "secondary" | "tertiary" | "error";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const railTone = {
    primary: "bg-[var(--primary)]",
    secondary: "bg-[var(--secondary)]",
    tertiary: "bg-[var(--accent)]",
    error: "bg-[var(--destructive)]",
  }[tone];

  return (
    <Card className="overflow-hidden rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] py-0 text-white ring-0">
      <div className="grid min-h-0 grid-cols-[4px_1fr]">
        <div className={railTone} />
        <div className="min-w-0">
          <CardHeader className="px-3 pt-3 pb-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line-subtle)] bg-black/10">
                {icon}
              </div>
              <div>
                <MonoLabel>Module</MonoLabel>
                <CardTitle className="mt-1 text-base text-white">{title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-3">{children}</CardContent>
        </div>
      </div>
    </Card>
  );
}

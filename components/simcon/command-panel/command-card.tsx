import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MonoLabel } from "@/components/ui/mono-label";

export function CommandCard({
  title,
  accentClassName,
  icon,
  children,
}: {
  title: string;
  accentClassName: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] py-0 text-white ring-0">
      <div className={accentClassName} />
      <CardHeader className="px-4 pt-4 pb-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            {icon}
          </div>
          <div>
            <MonoLabel>Module</MonoLabel>
            <CardTitle className="mt-1 text-lg text-white">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-4 pb-4">{children}</CardContent>
    </Card>
  );
}

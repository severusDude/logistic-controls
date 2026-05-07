import { cn } from "@/lib/utils";

type AppShellProps = {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <main className="dashboard-grid min-h-dvh w-full max-w-none text-sm">
      <div className="scanline panel-enter relative flex min-h-dvh w-full max-w-none flex-col overflow-hidden border border-[var(--line-subtle)] bg-[var(--bg-shell)] shadow-[var(--shadow-panel)]">
        {header}
        <div className={cn("flex flex-1 flex-col lg:flex-row")}>
          {sidebar}
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 md:p-4">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

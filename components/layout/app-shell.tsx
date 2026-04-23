import { cn } from "@/lib/utils";

type AppShellProps = {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <main className="dashboard-grid min-h-screen px-3 py-3 text-sm md:h-dvh md:max-h-dvh md:overflow-hidden md:px-6 md:py-6">
      <div className="scanline panel-enter relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1680px] flex-col overflow-hidden rounded-xl border border-[var(--line-subtle)] bg-[var(--bg-shell)] shadow-[var(--shadow-panel)] md:h-full md:max-h-[calc(100dvh-3rem)] md:min-h-0">
        {header}
        <div className={cn("flex flex-1 flex-col lg:min-h-0 lg:flex-row")}>
          {sidebar}
          <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:overflow-hidden md:p-4">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

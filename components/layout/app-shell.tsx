import { cn } from "@/lib/utils";

type AppShellProps = {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <main className="dashboard-grid min-h-screen px-4 py-4 text-sm md:px-6 md:py-6">
      <div className="scanline panel-enter relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1680px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[var(--bg-shell)] shadow-[var(--shadow-panel)]">
        {header}
        <div className={cn("flex flex-1 flex-col lg:flex-row")}>
          {sidebar}
          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-5">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

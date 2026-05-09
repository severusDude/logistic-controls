"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }

  return context;
}

function SidebarProvider({
  defaultCollapsed = false,
  children,
}: {
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const width = collapsed ? "76px" : "284px";

  React.useEffect(() => {
    document.documentElement.style.setProperty("--simcon-sidebar-width", width);

    return () => {
      document.documentElement.style.removeProperty("--simcon-sidebar-width");
    };
  }, [width]);

  const value = React.useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => setCollapsed((current) => !current),
    }),
    [collapsed],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

function Sidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"aside">) {
  const { collapsed } = useSidebar();

  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 flex h-dvh shrink-0 flex-col border-r border-[var(--line-subtle)] bg-[var(--bg-panel)] transition-[width] duration-200 ease-out max-md:[&_[data-sidebar-label]]:sr-only",
        collapsed ? "w-[76px]" : "w-[76px] md:w-[284px]",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("shrink-0 border-[var(--line-subtle)] p-3", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("min-h-0 flex-1 overflow-hidden p-3", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function SidebarMenuButton({
  className,
  active,
  collapsed,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <a
      data-slot="sidebar-menu-button"
      data-active={active}
      data-collapsed={collapsed}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition",
        active
          ? "border-sky-300/30 bg-sky-300/10 text-white"
          : "border-transparent bg-transparent text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:bg-[var(--bg-panel-soft)]",
        collapsed && "justify-center px-2",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-rail"
      className={cn("px-3 pb-3", className)}
      {...props}
    />
  );
}

function SidebarTrigger({ className }: { className?: string }) {
  const { collapsed, toggle } = useSidebar();
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "h-10 w-full rounded-lg border-[var(--line-subtle)] bg-transparent text-[var(--ink-soft)] hover:border-[var(--line-accent)] hover:bg-[color:rgba(56,189,248,0.08)]",
        collapsed && "w-10",
        className,
      )}
      onClick={toggle}
      aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      aria-pressed={collapsed}
    >
      <Icon className="size-4" />
    </Button>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
};

"use client";

import {
  AlertTriangle,
  Boxes,
  LayoutDashboard,
  MapPinned,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/simcon/types";

const navIcons = {
  overview: LayoutDashboard,
  fleet: Boxes,
  routes: MapPinned,
  alerts: AlertTriangle,
} as const;

function SideNavBody({ navItems }: { navItems: NavItem[] }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <SidebarHeader>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sm font-semibold text-sky-100">
            LC
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <MonoLabel>Control cluster</MonoLabel>
              <h2 className="truncate text-base font-semibold text-white">
                Java Freight Mesh
              </h2>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <div className="grid gap-4 pr-1">
            {!collapsed && (
              <div className="rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] p-3">
                <p className="text-sm leading-6 text-[var(--ink-soft)]">
                  Precision board for dock scanners, mobile trucks, and site gateways.
                </p>
              </div>
            )}
            <SidebarMenu aria-label="Primary navigation">
              {navItems.map((item) => {
                const Icon = navIcons[item.id as keyof typeof navIcons] ?? LayoutDashboard;

                return (
                  <SidebarMenuButton
                    key={item.id}
                    href={item.href}
                    active={item.active}
                    collapsed={collapsed}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate font-medium">{item.label}</span>}
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenu>
            {!collapsed && (
              <div className="rounded-lg border border-[var(--line-subtle)] bg-[#02070d] p-3">
                <div className="flex items-center gap-2 text-amber-100">
                  <ShieldAlert className="size-4" />
                  <MonoLabel className="text-amber-100">Safety rail</MonoLabel>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Escalations require dual operator acknowledgment before restart.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 h-10 w-full rounded-lg border-amber-300/30 bg-transparent text-amber-100 hover:bg-amber-300/18"
                >
                  Arm maintenance window
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarRail>
        <SidebarTrigger />
      </SidebarRail>
    </>
  );
}

export function SideNav({ navItems }: { navItems: NavItem[] }) {
  return (
    <Sidebar>
      <SideNavBody navItems={navItems} />
    </Sidebar>
  );
}

export function MobileSideNav({ navItems }: { navItems: NavItem[] }) {
  return (
    <div className="h-full bg-[var(--bg-panel)] text-white">
      <SideNavBody navItems={navItems} />
    </div>
  );
}

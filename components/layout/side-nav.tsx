"use client";

import { AlertTriangle, Boxes, LayoutDashboard, MapPinned } from "lucide-react";

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
import type { NavItem } from "@/lib/simcon/types";

const navIcons = {
  overview: LayoutDashboard,
  fleet: Boxes,
  alerts: AlertTriangle,
} as const;

function SideNavBody({ navItems }: { navItems: NavItem[] }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <SidebarHeader className="flex h-[73px] items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-base font-semibold text-sky-100">
          LC
        </div>
        {!collapsed && (
          <div data-sidebar-label className="min-w-0">
            <MonoLabel>Logistic Controls</MonoLabel>
            <p className="truncate text-sm font-semibold text-white">SimCon</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <div className="grid gap-4 pr-1">
            <SidebarMenu aria-label="Primary navigation">
              {navItems.map((item) => {
                const Icon =
                  navIcons[item.id as keyof typeof navIcons] ?? LayoutDashboard;

                return (
                  <SidebarMenuButton
                    key={item.id}
                    href={item.href}
                    active={item.active}
                    collapsed={collapsed}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && (
                      <span data-sidebar-label className="truncate font-medium">
                        {item.label}
                      </span>
                    )}
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenu>
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

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
                      <span className="truncate font-medium">{item.label}</span>
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

export function MobileSideNav({ navItems }: { navItems: NavItem[] }) {
  return (
    <div className="h-full bg-[var(--bg-panel)] text-white">
      <SideNavBody navItems={navItems} />
    </div>
  );
}

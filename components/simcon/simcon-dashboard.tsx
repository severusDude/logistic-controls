"use client";

import { useMemo, useState } from "react";
import { BarChart3, Menu } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SideNav } from "@/components/layout/side-nav";
import { TopBar } from "@/components/layout/top-bar";
import { DeviceCommandPanel } from "@/components/simcon/command-panel/device-command-panel";
import { DeviceTable } from "@/components/simcon/device-table/device-table";
import { MqttTerminalFeed } from "@/components/simcon/terminal/mqtt-terminal-feed";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import type { Device, NavItem, TerminalEntry } from "@/lib/simcon/types";

type SimconDashboardProps = {
  devices: Device[];
  navItems: NavItem[];
  terminalEntries: TerminalEntry[];
};

export function SimconDashboard({
  devices,
  navItems,
  terminalEntries,
}: SimconDashboardProps) {
  const [selectedId, setSelectedId] = useState(devices[0]?.id ?? "");
  const [showOffline, setShowOffline] = useState(true);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [paused, setPaused] = useState(false);

  const selectedDevice =
    devices.find((device) => device.id === selectedId) ?? devices[0];

  const visibleDevices = useMemo(() => {
    return devices.filter((device) => {
      if (!showOffline && device.status === "offline") {
        return false;
      }

      if (showOnlySelected && device.id !== selectedId) {
        return false;
      }

      return true;
    });
  }, [devices, selectedId, showOffline, showOnlySelected]);

  const visibleTerminalEntries = useMemo(() => {
    return terminalEntries.filter((entry) => {
      if (showOnlySelected && entry.deviceId !== selectedId) {
        return false;
      }

      return true;
    });
  }, [selectedId, showOnlySelected, terminalEntries]);

  return (
    <AppShell
      header={
        <TopBar
          sidebarTrigger={
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg border-[var(--line-subtle)] bg-transparent text-[var(--ink-soft)] hover:border-[var(--line-accent)] hover:bg-[color:rgba(56,189,248,0.08)] lg:hidden"
                  />
                }
              >
                <Menu />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="border-white/10 bg-[var(--bg-panel-strong)] p-0 text-white"
              >
                <SheetHeader className="border-b border-white/10 p-4">
                  <SheetTitle className="text-white">Control navigation</SheetTitle>
                </SheetHeader>
                <SideNav navItems={navItems} />
              </SheetContent>
            </Sheet>
          }
        />
      }
      sidebar={<div className="hidden h-full lg:block"><SideNav navItems={navItems} /></div>}
    >
      <HeroStrip devices={devices} />
      <section className="grid gap-3 md:min-h-0 md:flex-1 md:grid-rows-[minmax(0,1fr)] xl:grid-cols-[1.1fr_0.9fr]">
        <DeviceTable
          devices={visibleDevices}
          selectedDeviceId={selectedId}
          showOffline={showOffline}
          showOnlySelected={showOnlySelected}
          onSelectDevice={setSelectedId}
          onToggleOffline={() => setShowOffline((value) => !value)}
          onToggleSelected={() => setShowOnlySelected((value) => !value)}
        />
        <DeviceCommandPanel device={selectedDevice} />
      </section>
      <MqttTerminalFeed
        entries={visibleTerminalEntries}
        paused={paused}
        showOnlySelected={showOnlySelected}
        onTogglePaused={() => setPaused((value) => !value)}
      />
    </AppShell>
  );
}

function HeroStrip({ devices }: { devices: Device[] }) {
  const online = devices.filter((item) => item.status === "online").length;
  const warning = devices.filter((item) => item.status === "warning").length;
  const offline = devices.filter((item) => item.status === "offline").length;

  const stats = [
    { label: "Assets online", value: `${online}/${devices.length}`, tone: "text-emerald-200" },
    { label: "Warning nodes", value: `${warning}`, tone: "text-amber-100" },
    { label: "Offline assets", value: `${offline}`, tone: "text-rose-100" },
    { label: "Lane throughput", value: "2.1k scans/hr", tone: "text-sky-100" },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="panel-enter rounded-xl border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] p-3"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-sky-100" />
            <MonoLabel>{stat.label}</MonoLabel>
          </div>
          <p className={`mt-2 text-2xl font-semibold tracking-[-0.02em] ${stat.tone}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  );
}

"use client";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  BarChart3,
  Boxes,
  Clock,
  MapPin,
  PackageCheck,
  Radio,
  Terminal,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SideNav } from "@/components/layout/side-nav";
import { TopBar } from "@/components/layout/top-bar";
import { DeviceCommandPanel } from "@/components/simcon/command-panel/device-command-panel";
import { DeviceTable } from "@/components/simcon/device-table/device-table";
import { MqttTerminalFeed } from "@/components/simcon/terminal/mqtt-terminal-feed";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { RealtimePackageEvent, RealtimeSnapshot } from "@/lib/backend/realtime/contracts";
import type { Device, NavItem, TerminalEntry } from "@/lib/simcon/types";

type SimconDashboardProps = {
  devices: Device[];
  navItems: NavItem[];
  packageEvents: RealtimePackageEvent[];
  terminalEntries: TerminalEntry[];
  realtimeUrl?: string;
};

type ActiveItem =
  | { type: "device"; id: string }
  | { type: "packageEvent"; eventId: string };

export function SimconDashboard({
  devices,
  navItems,
  packageEvents,
  terminalEntries,
  realtimeUrl = "/api/realtime/stream",
}: SimconDashboardProps) {
  const [liveDevices, setLiveDevices] = useState(devices);
  const [livePackageEvents, setLivePackageEvents] = useState(packageEvents);
  const [liveTerminalEntries, setLiveTerminalEntries] = useState(terminalEntries);
  const [selectedId, setSelectedId] = useState(devices[0]?.id ?? "");
  const [showOffline, setShowOffline] = useState(true);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

  const activeSelectedId = useMemo(
    () =>
      liveDevices.some((device) => device.id === selectedId)
        ? selectedId
        : (liveDevices[0]?.id ?? ""),
    [liveDevices, selectedId],
  );

  const activeDevice =
    activeItem?.type === "device"
      ? liveDevices.find((device) => device.id === activeItem.id)
      : null;

  const activePackageEvent =
    activeItem?.type === "packageEvent"
      ? livePackageEvents.find((event) => event.eventId === activeItem.eventId)
      : null;

  const handleSnapshot = useEffectEvent((snapshot: RealtimeSnapshot) => {
    startTransition(() => {
      setLiveDevices(snapshot.devices);
      setLivePackageEvents(snapshot.packageEvents);
      setLiveTerminalEntries(snapshot.terminalEntries);
    });
  });

  useEffect(() => {
    const eventSource = new EventSource(realtimeUrl);

    const onSnapshot = (event: MessageEvent<string>) => {
      try {
        const snapshot = JSON.parse(event.data) as RealtimeSnapshot;
        handleSnapshot(snapshot);
      } catch (error) {
        console.error("[simcon] Failed to parse realtime snapshot", error);
      }
    };

    const onError = (error: Event) => {
      console.error("[simcon] Realtime stream error", error);
    };

    eventSource.addEventListener("snapshot", onSnapshot as EventListener);
    eventSource.addEventListener("error", onError);

    return () => {
      eventSource.removeEventListener("snapshot", onSnapshot as EventListener);
      eventSource.removeEventListener("error", onError);
      eventSource.close();
    };
  }, [realtimeUrl]);

  const visibleDevices = useMemo(() => {
    return liveDevices.filter((device) => {
      if (!showOffline && device.status === "offline") {
        return false;
      }

      if (showOnlySelected && device.id !== activeSelectedId) {
        return false;
      }

      return true;
    });
  }, [activeSelectedId, liveDevices, showOffline, showOnlySelected]);

  const visibleTerminalEntries = useMemo(() => {
    return liveTerminalEntries.filter((entry) => {
      if (showOnlySelected && entry.deviceId !== activeSelectedId) {
        return false;
      }

      return true;
    });
  }, [activeSelectedId, liveTerminalEntries, showOnlySelected]);

  const selectDevice = (id: string) => {
    setSelectedId(id);
    setActiveItem({ type: "device", id });
  };

  return (
    <SidebarProvider>
      <AppShell
        header={
          <TopBar
            terminalTrigger={
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-lg border-[var(--line-subtle)] bg-transparent text-[var(--ink-soft)] hover:border-[var(--line-accent)] hover:bg-[color:rgba(56,189,248,0.08)]"
                onClick={() => setTerminalOpen(true)}
                aria-label="Open terminal"
              >
                <Terminal className="size-4" />
              </Button>
            }
          />
        }
        sidebar={<SideNav navItems={navItems} />}
      >
        <HeroStrip devices={liveDevices} />
        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <DeviceTable
            devices={visibleDevices}
            selectedDeviceId={activeSelectedId}
            showOffline={showOffline}
            showOnlySelected={showOnlySelected}
            onSelectDevice={selectDevice}
            onToggleOffline={() => setShowOffline((value) => !value)}
            onToggleSelected={() => setShowOnlySelected((value) => !value)}
          />
          <PackageEventPane
            events={livePackageEvents}
            onSelect={(eventId) => setActiveItem({ type: "packageEvent", eventId })}
          />
        </section>

        <Sheet open={terminalOpen} onOpenChange={setTerminalOpen}>
          <SheetContent
            side="bottom"
            className="!right-0 !bottom-0 !left-0 h-[min(54dvh,520px)] !w-auto max-w-none border-white/10 bg-[var(--bg-shell)] p-0 text-white sm:max-w-none lg:!left-[var(--simcon-sidebar-width)]"
          >
            <SheetHeader className="border-b border-white/10 p-4">
              <SheetTitle className="text-white">MQTT terminal</SheetTitle>
              <SheetDescription className="text-[var(--ink-soft)]">
                Recent raw events from backend snapshot stream.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 p-4">
              <MqttTerminalFeed
                entries={visibleTerminalEntries}
                paused={paused}
                showOnlySelected={showOnlySelected}
                onTogglePaused={() => setPaused((value) => !value)}
                className="h-[calc(54dvh-7rem)] min-h-[220px] max-h-[400px] md:h-[calc(54dvh-7rem)] md:max-h-[400px]"
              />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet
          open={Boolean(activeItem)}
          onOpenChange={(open) => {
            if (!open) {
              setActiveItem(null);
            }
          }}
        >
          <SheetContent
            side="right"
            className="w-[min(96vw,720px)] max-w-none overflow-hidden border-white/10 bg-[var(--bg-shell)] p-0 text-white sm:max-w-none"
          >
            {activeDevice ? (
              <DeviceInspector device={activeDevice} />
            ) : activePackageEvent ? (
              <PackageEventInspector event={activePackageEvent} />
            ) : (
              <EmptyInspector />
            )}
          </SheetContent>
        </Sheet>
      </AppShell>
    </SidebarProvider>
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
          className="panel-enter rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] p-3"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-sky-100" />
            <MonoLabel>{stat.label}</MonoLabel>
          </div>
          <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  );
}

function PackageEventPane({
  events,
  onSelect,
}: {
  events: RealtimePackageEvent[];
  onSelect: (eventId: string) => void;
}) {
  return (
    <section className="flex min-h-[320px] flex-col rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-strong)]">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
        <div>
          <MonoLabel>Package evidence</MonoLabel>
          <h2 className="mt-1 text-base font-semibold text-white">Recent package events</h2>
        </div>
        <PackageCheck className="size-5 text-sky-100" />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-2 p-3">
          {events.length ? (
            events.map((event) => (
              <button
                key={event.eventId}
                type="button"
                className="rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] p-3 text-left transition hover:border-[var(--line-accent)] hover:bg-[color:rgba(56,189,248,0.08)]"
                onClick={() => onSelect(event.eventId)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-semibold text-white">{event.trackingId}</span>
                  <span className="rounded-full bg-sky-300/10 px-2 py-0.5 text-xs text-sky-100">
                    {event.status ?? "event"}
                  </span>
                </div>
                <p className="mt-2 truncate text-sm text-[var(--ink-soft)]">
                  {event.scanContext ?? "scan"} / {event.deviceId ?? "unknown device"}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {formatDateTime(event.timestampUtc)}
                </p>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--line-subtle)] p-4 text-sm text-[var(--ink-soft)]">
              No package events in current snapshot.
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}

function DeviceInspector({ device }: { device: Device }) {
  return (
    <>
      <SheetHeader className="border-b border-white/10 p-4 pr-14">
        <SheetTitle className="text-white">{device.id}</SheetTitle>
        <SheetDescription className="text-[var(--ink-soft)]">
          {device.facility} / {device.zone}
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-4 p-4">
          <InspectorStats
            items={[
              { icon: Radio, label: "Status", value: device.status },
              { icon: Activity, label: "Connection", value: device.connectionStatus },
              { icon: MapPin, label: "GPS", value: device.hasGps ? "available" : "not available" },
              { icon: Clock, label: "Last heartbeat", value: device.lastBeat },
            ]}
          />
          <DeviceCommandPanel device={device} />
        </div>
      </ScrollArea>
    </>
  );
}

function PackageEventInspector({ event }: { event: RealtimePackageEvent }) {
  return (
    <>
      <SheetHeader className="border-b border-white/10 p-4 pr-14">
        <SheetTitle className="text-white">{event.trackingId}</SheetTitle>
        <SheetDescription className="text-[var(--ink-soft)]">
          Package event evidence from realtime snapshot.
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-4 p-4">
          <InspectorStats
            items={[
              { icon: PackageCheck, label: "Status", value: event.status ?? "none" },
              { icon: Boxes, label: "Scan context", value: event.scanContext ?? "none" },
              { icon: Radio, label: "Device", value: event.deviceId ?? "unknown" },
              { icon: MapPin, label: "Facility", value: event.facilityCode ?? "unknown" },
            ]}
          />
          <div className="rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] p-4">
            <MonoLabel>Event details</MonoLabel>
            <dl className="mt-3 grid gap-3 text-sm">
              <DetailRow label="Event ID" value={event.eventId} />
              <DetailRow label="Location" value={event.locationName ?? "unknown"} />
              <DetailRow label="Latitude" value={event.lat?.toString() ?? "n/a"} />
              <DetailRow label="Longitude" value={event.lng?.toString() ?? "n/a"} />
              <DetailRow label="Timestamp" value={formatDateTime(event.timestampUtc)} />
            </dl>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

function EmptyInspector() {
  return (
    <div className="grid h-full place-items-center p-6 text-sm text-[var(--ink-soft)]">
      Item no longer available in current snapshot.
    </div>
  );
}

function InspectorStats({
  items,
}: {
  items: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
  }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] p-3"
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-sky-100" />
              <MonoLabel>{item.label}</MonoLabel>
            </div>
            <p className="mt-2 break-words text-sm font-semibold text-white">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <dt className="text-[var(--ink-muted)]">{label}</dt>
        <dd className="max-w-[65%] break-words text-right font-mono text-xs text-white">
          {value}
        </dd>
      </div>
      <Separator className="bg-white/8 last:hidden" />
    </>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

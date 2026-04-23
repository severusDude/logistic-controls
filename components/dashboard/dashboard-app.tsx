"use client";

import { useMemo, useState } from "react";
import type {
  ConnectionStatus,
  Device,
  DeviceStatus,
  NavItem,
  TerminalEntry,
  TerminalLevel,
} from "@/lib/dashboard/types";

type DashboardAppProps = {
  devices: Device[];
  navItems: NavItem[];
  terminalEntries: TerminalEntry[];
};

const statusTone: Record<
  DeviceStatus,
  { dot: string; text: string; chip: string }
> = {
  online: {
    dot: "bg-[var(--signal-online)]",
    text: "text-[var(--signal-online)]",
    chip: "bg-emerald-400/12 text-emerald-200",
  },
  warning: {
    dot: "bg-[var(--signal-warning)]",
    text: "text-[var(--signal-warning)]",
    chip: "bg-amber-300/12 text-amber-100",
  },
  offline: {
    dot: "bg-[var(--signal-offline)]",
    text: "text-[var(--signal-offline)]",
    chip: "bg-rose-400/12 text-rose-100",
  },
  idle: {
    dot: "bg-[var(--signal-neutral)]",
    text: "text-[var(--signal-neutral)]",
    chip: "bg-slate-300/12 text-slate-200",
  },
};

const connectionTone: Record<ConnectionStatus, string> = {
  connected: "bg-emerald-400/14 text-emerald-100 ring-1 ring-emerald-400/25",
  degraded: "bg-amber-300/14 text-amber-100 ring-1 ring-amber-300/25",
  rebuilding: "bg-sky-300/14 text-sky-100 ring-1 ring-sky-300/25",
  offline: "bg-rose-400/14 text-rose-100 ring-1 ring-rose-400/25",
};

const levelTone: Record<TerminalLevel, string> = {
  neutral: "text-slate-300",
  info: "text-sky-200",
  success: "text-emerald-200",
  warning: "text-amber-200",
  error: "text-rose-200",
};

export function DashboardApp({
  devices,
  navItems,
  terminalEntries,
}: DashboardAppProps) {
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
    <main className="dashboard-grid min-h-screen px-4 py-4 text-sm md:px-6 md:py-6">
      <div className="scanline panel-enter relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1680px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[var(--bg-shell)] shadow-[var(--shadow-panel)]">
        <TopBar />
        <div className="flex flex-1 flex-col lg:flex-row">
          <SideNav navItems={navItems} />
          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-5">
            <HeroStrip devices={devices} />
            <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <DeviceMatrix
                devices={visibleDevices}
                selectedId={selectedId}
                showOffline={showOffline}
                showOnlySelected={showOnlySelected}
                onSelect={setSelectedId}
                onToggleOffline={() => setShowOffline((value) => !value)}
                onToggleSelected={() => setShowOnlySelected((value) => !value)}
              />
              <CommandDeck device={selectedDevice} />
            </section>
            <TerminalPanel
              entries={visibleTerminalEntries}
              paused={paused}
              showOnlySelected={showOnlySelected}
              onTogglePaused={() => setPaused((value) => !value)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--line-subtle)] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-lg font-semibold text-sky-100">
          LC
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[var(--ink-muted)]">
            Logistic Controls
          </p>
          <h1 className="text-lg font-semibold tracking-[0.08em] text-white md:text-xl">
            Fleet Command Dashboard
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex h-11 min-w-[260px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-[var(--ink-soft)]">
          <RadarIcon className="h-4 w-4 text-sky-200" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--ink-muted)]"
            placeholder="Search asset, lane, facility"
            aria-label="Search asset, lane, facility"
          />
        </label>
        <div className="flex items-center gap-2">
          <TopPill label="MQTT mesh" value="stable" />
          <TopPill label="Shift" value="A3" />
          <button className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 font-medium text-rose-100 transition hover:bg-rose-400/20">
            Halt noncritical
          </button>
        </div>
      </div>
    </header>
  );
}

function TopPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function SideNav({ navItems }: { navItems: NavItem[] }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[var(--line-subtle)] bg-[var(--bg-panel)] p-4 lg:w-[290px] lg:border-b-0 lg:border-r">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--ink-muted)]">
          Control cluster
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">Java Freight Mesh</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          Precision board for dock scanners, mobile trucks, and site gateways.
        </p>
      </div>
      <nav className="mt-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
              item.active
                ? "border-sky-300/30 bg-sky-300/10 text-white"
                : "border-white/6 bg-white/[0.02] text-[var(--ink-soft)] hover:border-white/14 hover:bg-white/[0.05]"
            }`}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-mono text-[11px] tracking-[0.16em]">
              {item.shortLabel}
            </span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-[24px] border border-white/10 bg-[#02070d] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
          Safety rail
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          Escalations require dual operator acknowledgment before restart.
        </p>
        <button className="mt-4 w-full rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 font-semibold text-amber-100 transition hover:bg-amber-300/18">
          Arm maintenance window
        </button>
      </div>
    </aside>
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
          className="panel-enter rounded-[24px] border border-white/10 bg-[var(--bg-panel-soft)] p-4"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--ink-muted)]">
            {stat.label}
          </p>
          <p className={`mt-3 text-2xl font-semibold tracking-[0.08em] ${stat.tone}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  );
}

type DeviceMatrixProps = {
  devices: Device[];
  selectedId: string;
  showOffline: boolean;
  showOnlySelected: boolean;
  onSelect: (id: string) => void;
  onToggleOffline: () => void;
  onToggleSelected: () => void;
};

function DeviceMatrix({
  devices,
  selectedId,
  showOffline,
  showOnlySelected,
  onSelect,
  onToggleOffline,
  onToggleSelected,
}: DeviceMatrixProps) {
  return (
    <section className="flex min-h-[420px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[var(--bg-panel)]">
      <div className="flex flex-col gap-4 border-b border-[var(--line-subtle)] px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--ink-muted)]">
            Device matrix
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Site endpoints</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterToggle
            active={showOffline}
            label="Show offline"
            onClick={onToggleOffline}
          />
          <FilterToggle
            active={showOnlySelected}
            label="Focus selection"
            onClick={onToggleSelected}
          />
        </div>
      </div>
      <div className="grid grid-cols-[1.15fr_0.8fr_0.7fr_0.7fr] gap-3 border-b border-[var(--line-subtle)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ink-muted)]">
        <span>Asset</span>
        <span>Facility</span>
        <span>Throughput</span>
        <span>Last beat</span>
      </div>
      <div className="flex-1 overflow-auto">
        {devices.map((device) => {
          const tone = statusTone[device.status];
          const selected = device.id === selectedId;

          return (
            <button
              key={device.id}
              type="button"
              onClick={() => onSelect(device.id)}
              className={`grid w-full grid-cols-[1.15fr_0.8fr_0.7fr_0.7fr] gap-3 border-b border-white/6 px-4 py-4 text-left transition ${
                selected
                  ? "bg-[var(--bg-row-active)]"
                  : "bg-[var(--bg-row)] hover:bg-white/[0.04]"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                  <span className="truncate font-semibold tracking-[0.08em] text-white">
                    {device.id}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${tone.chip}`}>
                    {device.status}
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                  {device.role} / {device.type} / gps {device.hasGps ? "on" : "off"}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--ink-soft)]">{device.facility}</p>
                <p className="mt-2 truncate text-xs text-[var(--ink-muted)]">{device.zone}</p>
              </div>
              <div className="font-mono text-[13px] text-[var(--ink-soft)]">
                {device.throughput}
              </div>
              <div className={`font-mono text-[13px] ${tone.text}`}>{device.lastBeat}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FilterToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-sky-300/30 bg-sky-300/12 text-sky-50"
          : "border-white/10 bg-white/5 text-[var(--ink-soft)] hover:bg-white/8"
      }`}
    >
      {label}
    </button>
  );
}

function CommandDeck({ device }: { device: Device }) {
  return (
    <section className="flex min-h-[420px] flex-col overflow-auto rounded-[28px] border border-white/10 bg-[var(--bg-panel-strong)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line-subtle)] pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--ink-muted)]">
            Command deck
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[0.08em] text-white">
            {device.id}
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {device.facility} / {device.zone}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${connectionTone[device.connectionStatus]}`}
        >
          {device.connectionStatus}
        </span>
      </div>
      <div className="mt-4 grid gap-4">
        <CommandCard
          title="Configuration uplink"
          accent="from-sky-300/80 to-cyan-300/20"
          icon={<GridIcon className="h-5 w-5 text-sky-100" />}
        >
          <InfoGrid
            items={[
              { label: "Role", value: device.role },
              { label: "Facility", value: device.facility },
              { label: "Zone", value: device.zone },
            ]}
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ControlField label="Role profile" value={device.role.toUpperCase()} />
            <ControlField label="Location ring" value={device.zone} />
          </div>
          <button className="mt-4 rounded-2xl border border-sky-300/30 bg-sky-300/10 px-4 py-3 font-semibold text-sky-50 transition hover:bg-sky-300/20">
            Push updated config
          </button>
        </CommandCard>
        <CommandCard
          title="Timing parameters"
          accent="from-emerald-300/80 to-teal-300/20"
          icon={<PulseIcon className="h-5 w-5 text-emerald-100" />}
        >
          <InfoGrid
            items={[
              { label: "Cooldown", value: `${device.scanCooldown}s` },
              { label: "Battery", value: device.battery },
              { label: "Heartbeat", value: device.lastBeat },
            ]}
          />
          <div className="mt-4 rounded-2xl border border-emerald-300/16 bg-emerald-300/8 p-3 text-sm leading-6 text-emerald-50">
            Cooldown rail clamps duplicate scan bursts during lane congestion and mesh retries.
          </div>
          <button className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 font-semibold text-emerald-50 transition hover:bg-emerald-300/20">
            Sync timing window
          </button>
        </CommandCard>
        <CommandCard
          title="Immediate execution"
          accent="from-amber-200/80 to-rose-300/20"
          icon={<BoltIcon className="h-5 w-5 text-amber-100" />}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <button className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-left transition hover:bg-white/10">
              <p className="font-semibold text-white">Force scan</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                Trigger manual barcode acquisition on next camera frame.
              </p>
            </button>
            <button className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-4 text-left transition hover:bg-rose-400/18">
              <p className="font-semibold text-rose-50">Reboot sequence</p>
              <p className="mt-2 text-sm leading-6 text-rose-100/80">
                Restart endpoint and request fresh session token from gateway.
              </p>
            </button>
          </div>
        </CommandCard>
      </div>
    </section>
  );
}

function CommandCard({
  title,
  accent,
  icon,
  children,
}: {
  title: string;
  accent: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            {icon}
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--ink-muted)]">
              Module
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </article>
  );
}

function InfoGrid({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/8 bg-black/10 p-3"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            {item.label}
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--ink-soft)]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ControlField({ label, value }: { label: string; value: string }) {
  return (
    <label className="rounded-2xl border border-white/8 bg-black/10 p-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
        {label}
      </span>
      <input
        defaultValue={value}
        className="mt-3 w-full bg-transparent text-sm font-medium text-white outline-none"
      />
    </label>
  );
}

function TerminalPanel({
  entries,
  paused,
  showOnlySelected,
  onTogglePaused,
}: {
  entries: TerminalEntry[];
  paused: boolean;
  showOnlySelected: boolean;
  onTogglePaused: () => void;
}) {
  return (
    <section className="flex min-h-[280px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#02070d]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--ink-muted)]">
            MQTT terminal
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Event stream</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {showOnlySelected ? "selection scoped" : "all assets"}
          </span>
          <button
            type="button"
            onClick={onTogglePaused}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            {paused ? "Resume feed" : "Pause feed"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 py-3 font-mono text-[13px]">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="grid gap-3 border-b border-white/6 py-3 md:grid-cols-[140px_120px_1fr]"
          >
            <div className="text-[var(--ink-muted)]">{entry.timestamp}</div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${levelDot(entry.level)}`} />
              <span className={`${levelTone[entry.level]}`}>{entry.category}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sky-100">{entry.deviceId}</span>
              <span className="text-[var(--ink-soft)]">{entry.message}</span>
              {entry.badge ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-white">
                  {entry.badge}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function levelDot(level: TerminalLevel) {
  switch (level) {
    case "success":
      return "bg-emerald-300";
    case "warning":
      return "bg-amber-300";
    case "error":
      return "bg-rose-300";
    case "info":
      return "bg-sky-300";
    default:
      return "bg-slate-400";
  }
}

function RadarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 12 19 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function PulseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 12h4l2.2-4 4 8 2.2-4H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

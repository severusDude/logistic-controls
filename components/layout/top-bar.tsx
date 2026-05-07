"use client";

import { Bell, Settings2, Terminal } from "lucide-react";
import { AppSearchInput } from "@/components/ui/app-search-input";
import { IconButton } from "@/components/ui/icon-button";
import { MonoLabel } from "@/components/ui/mono-label";

export function TopBar({
  terminalTrigger,
}: {
  terminalTrigger?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-[var(--line-subtle)] px-3 py-3 md:flex-row md:items-center md:justify-between md:px-4">
      <div className="flex items-center gap-3">
        <div>
          <MonoLabel>Logistic Controls</MonoLabel>
          <h1 className="text-lg font-semibold tracking-[-0.01em] text-white md:text-xl">
            Prototype
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <AppSearchInput
          aria-label="Search asset, lane, facility"
          placeholder="Search asset, lane, facility"
        />
        <div className="flex items-center gap-2">
          <TopPill label="MQTT mesh" value="stable" />
          <TopPill label="Shift" value="A3" />
          <IconButton aria-label="Notifications">
            <Bell />
          </IconButton>
          <IconButton aria-label="Settings">
            <Settings2 />
          </IconButton>
          {terminalTrigger ?? (
            <IconButton aria-label="Open terminal">
              <Terminal />
            </IconButton>
          )}
        </div>
      </div>
    </header>
  );
}

function TopPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-panel-soft)] px-2.5 py-1.5 flex items-center gap-2">
      <MonoLabel className="text-[11px]">{label}</MonoLabel>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

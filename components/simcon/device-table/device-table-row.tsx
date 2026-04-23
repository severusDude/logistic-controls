import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { NumericText } from "@/components/ui/numeric-text";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Device, DeviceStatus } from "@/lib/simcon/types";
import { cn } from "@/lib/utils";

const chipTone: Record<DeviceStatus, string> = {
  online: "bg-emerald-400/12 text-emerald-200",
  warning: "bg-amber-300/12 text-amber-100",
  offline: "bg-rose-400/12 text-rose-100",
  idle: "bg-slate-300/12 text-slate-200",
};

const textTone: Record<DeviceStatus, string> = {
  online: "text-[var(--signal-online)]",
  warning: "text-[var(--signal-warning)]",
  offline: "text-[var(--signal-offline)]",
  idle: "text-[var(--signal-neutral)]",
};

export function DeviceTableRow({
  device,
  selected,
  onClick,
}: {
  device: Device;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <TableRow
      data-state={selected ? "selected" : "idle"}
      className={cn(
        "cursor-pointer border-white/6 bg-[var(--bg-row)] transition hover:bg-white/[0.04] data-[state=selected]:bg-[var(--bg-row-active)]",
      )}
      onClick={onClick}
    >
      <TableCell className="px-4 py-4 align-top">
        <div className="flex items-center gap-3">
          <StatusDot status={device.status} pulse={device.status === "online"} />
          <span className="truncate font-semibold tracking-[0.08em] text-white">
            {device.id}
          </span>
          <Badge
            className={cn(
              "rounded-full border-0 px-2 py-1 text-[10px] font-medium capitalize",
              chipTone[device.status],
            )}
          >
            {device.status}
          </Badge>
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          {device.role} / {device.type} / gps {device.hasGps ? "on" : "off"}
        </p>
      </TableCell>
      <TableCell className="px-4 py-4 align-top">
        <p className="truncate font-medium text-[var(--ink-soft)]">{device.facility}</p>
        <p className="mt-2 truncate text-xs text-[var(--ink-muted)]">{device.zone}</p>
      </TableCell>
      <TableCell className="px-4 py-4 align-top">
        <NumericText className="text-[var(--ink-soft)]">{device.throughput}</NumericText>
      </TableCell>
      <TableCell className="px-4 py-4 align-top">
        <NumericText className={textTone[device.status]}>{device.lastBeat}</NumericText>
      </TableCell>
    </TableRow>
  );
}

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonoLabel } from "@/components/ui/mono-label";

export function DeviceTableHeader() {
  return (
    <TableHeader className="sticky top-0 z-10 bg-[var(--bg-panel-strong)]">
      <TableRow className="border-white/10 bg-[var(--bg-panel-strong)] hover:bg-[var(--bg-panel-strong)]">
        <TableHead className="w-[34%] bg-[var(--bg-panel-strong)] px-4 py-3">
          <MonoLabel className="text-[12px]">Asset</MonoLabel>
        </TableHead>
        <TableHead className="w-[24%] bg-[var(--bg-panel-strong)] px-4 py-3">
          <MonoLabel className="text-[12px]">Facility</MonoLabel>
        </TableHead>
        <TableHead className="w-[22%] bg-[var(--bg-panel-strong)] px-4 py-3">
          <MonoLabel className="text-[12px]">Throughput</MonoLabel>
        </TableHead>
        <TableHead className="w-[20%] bg-[var(--bg-panel-strong)] px-4 py-3">
          <MonoLabel className="text-[12px]">Last beat</MonoLabel>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

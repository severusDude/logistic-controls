import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonoLabel } from "@/components/ui/mono-label";

export function DeviceTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-white/10 hover:bg-transparent">
        <TableHead className="w-[34%] px-4 py-3">
          <MonoLabel className="text-[11px] tracking-[0.22em]">Asset</MonoLabel>
        </TableHead>
        <TableHead className="w-[24%] px-4 py-3">
          <MonoLabel className="text-[11px] tracking-[0.22em]">Facility</MonoLabel>
        </TableHead>
        <TableHead className="w-[22%] px-4 py-3">
          <MonoLabel className="text-[11px] tracking-[0.22em]">Throughput</MonoLabel>
        </TableHead>
        <TableHead className="w-[20%] px-4 py-3">
          <MonoLabel className="text-[11px] tracking-[0.22em]">Last beat</MonoLabel>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

import { SectionCard } from "@/components/ui/section-card";
import { Table, TableBody } from "@/components/ui/table";
import type { Device } from "@/lib/simcon/types";
import { DeviceTableHeader } from "@/components/simcon/device-table/device-table-header";
import { DeviceTableRow } from "@/components/simcon/device-table/device-table-row";
import { DeviceTableToolbar } from "@/components/simcon/device-table/device-table-toolbar";

export function DeviceTable({
  devices,
  selectedDeviceId,
  showOffline,
  showOnlySelected,
  onSelectDevice,
  onToggleOffline,
  onToggleSelected,
}: {
  devices: Device[];
  selectedDeviceId?: string;
  showOffline: boolean;
  showOnlySelected: boolean;
  onSelectDevice: (id: string) => void;
  onToggleOffline: () => void;
  onToggleSelected: () => void;
}) {
  return (
    <SectionCard className="min-h-0 overflow-hidden" contentClassName="flex min-h-0 flex-1 flex-col px-0 pb-0">
      <DeviceTableToolbar
        showOffline={showOffline}
        showOnlySelected={showOnlySelected}
        onToggleOffline={onToggleOffline}
        onToggleSelected={onToggleSelected}
      />
      <div className="min-h-0 flex-1 overflow-auto">
        <Table>
          <DeviceTableHeader />
          <TableBody>
            {devices.map((device) => (
              <DeviceTableRow
                key={device.id}
                device={device}
                selected={device.id === selectedDeviceId}
                onClick={() => onSelectDevice(device.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}

import { Filter, RefreshCw } from "lucide-react";
import { PanelHeader } from "@/components/layout/panel-header";
import { IconButton } from "@/components/ui/icon-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function DeviceTableToolbar({
  showOffline,
  showOnlySelected,
  onToggleOffline,
  onToggleSelected,
}: {
  showOffline: boolean;
  showOnlySelected: boolean;
  onToggleOffline: () => void;
  onToggleSelected: () => void;
}) {
  return (
    <div className="border-b border-[var(--line-subtle)] px-3 py-3">
      <PanelHeader
        title="Devices List"
        action={
          <div className="flex items-center gap-2">
            <IconButton aria-label="Refresh endpoints">
              <RefreshCw />
            </IconButton>
            <IconButton tone="active" aria-label="Filter endpoints">
              <Filter />
            </IconButton>
          </div>
        }
      />
      <div className="mt-3 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={showOffline}
            onCheckedChange={onToggleOffline}
            aria-label="Show offline devices"
          />
          <Label className="text-sm text-[var(--ink-soft)]">Show offline</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={showOnlySelected}
            onCheckedChange={onToggleSelected}
            aria-label="Focus selected device"
          />
          <Label className="text-sm text-[var(--ink-soft)]">
            Focus selection
          </Label>
        </div>
      </div>
    </div>
  );
}

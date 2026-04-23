import { SimconDashboard } from "@/components/simcon/simcon-dashboard";
import { devices, navItems, terminalEntries } from "@/lib/simcon/mock-data";

export default function SimconPage() {
  return (
    <SimconDashboard
      devices={devices}
      navItems={navItems}
      terminalEntries={terminalEntries}
    />
  );
}

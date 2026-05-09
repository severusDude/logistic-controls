import { SimconDashboard } from "@/components/simcon/simcon-dashboard";
import { devices, navItems, packageEvents, terminalEntries } from "@/lib/simcon/mock-data";

export default function Page() {
  return (
    <SimconDashboard
      devices={devices}
      navItems={navItems}
      packageEvents={packageEvents}
      terminalEntries={terminalEntries}
    />
  );
}

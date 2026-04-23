import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { devices, navItems, terminalEntries } from "@/lib/dashboard/mock-data";

export default function Page() {
  return (
    <DashboardApp
      devices={devices}
      navItems={navItems}
      terminalEntries={terminalEntries}
    />
  );
}

import { SimconDashboard } from "@/components/simcon/simcon-dashboard";
import { getRealtimeSnapshot } from "@/lib/backend/realtime/snapshot";
import { navItems } from "@/lib/simcon/mock-data";

export const dynamic = "force-dynamic";

export default async function SimconPage() {
  const snapshot = await getRealtimeSnapshot();

  return (
    <SimconDashboard
      devices={snapshot.devices}
      navItems={navItems}
      terminalEntries={snapshot.terminalEntries}
    />
  );
}

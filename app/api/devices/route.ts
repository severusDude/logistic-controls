import { getDeviceSnapshots } from "@/lib/backend/queries/devices";

export const dynamic = "force-dynamic";

export async function GET() {
  const devices = await getDeviceSnapshots();
  return Response.json({ devices });
}

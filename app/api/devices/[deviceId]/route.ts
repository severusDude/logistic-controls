import { getDeviceSnapshot } from "@/lib/backend/queries/devices";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ deviceId: string }> },
) {
  const { deviceId } = await context.params;
  const device = await getDeviceSnapshot(deviceId);

  if (!device) {
    return Response.json({ error: "Device not found" }, { status: 404 });
  }

  return Response.json(device);
}

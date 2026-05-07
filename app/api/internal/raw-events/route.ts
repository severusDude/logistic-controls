import { RawEventType } from "@/generated/prisma/client";
import { getRawEvents } from "@/lib/backend/queries/raw-events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId") ?? undefined;
  const type = searchParams.get("type");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  if (limitParam && Number.isNaN(limit)) {
    return Response.json({ error: "Invalid limit" }, { status: 400 });
  }

  if (
    type &&
    type !== RawEventType.telemetry &&
    type !== RawEventType.scan &&
    type !== RawEventType.heartbeat
  ) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  const events = await getRawEvents({
    deviceId,
    type: type as RawEventType | undefined,
    limit,
  });

  return Response.json({
    events: events.map((event) => ({
      id: event.id,
      topic: event.topic,
      deviceId: event.deviceId,
      eventType: event.eventType,
      schemaVersion: event.schemaVersion,
      qos: event.qos,
      retain: event.retain,
      ingestedAt: event.ingestedAt,
      payload: event.payload,
    })),
  });
}

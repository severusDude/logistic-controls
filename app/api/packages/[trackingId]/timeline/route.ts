import { getPackageTimeline } from "@/lib/backend/queries/packages";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ trackingId: string }> },
) {
  const { trackingId } = await context.params;
  const timeline = await getPackageTimeline(trackingId);

  if (!timeline) {
    return Response.json({ error: "Package not found" }, { status: 404 });
  }

  return Response.json(timeline);
}

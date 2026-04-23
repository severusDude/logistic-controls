import { getAppConfig } from "@/lib/backend/config";
import { prisma } from "@/lib/backend/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getAppConfig();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: "ok",
      database: "ok",
      mqtt: {
        configured: config.mqttConfigured,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    return Response.json(
      {
        status: "degraded",
        database: {
          status: "error",
          message,
        },
        mqtt: {
          configured: config.mqttConfigured,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

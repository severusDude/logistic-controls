import z, { ZodError } from "zod";
import {
  publishDeviceCommand,
  PublishDeviceCommandError,
} from "@/lib/backend/commands/publish-device-command";
import {
  commandRouteConfig,
  commandRouteSegmentSchema,
} from "@/lib/backend/schemas/cmd";

export const runtime = "nodejs";

async function readJsonBody(request: Request) {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new PublishDeviceCommandError("Request body must be valid JSON", 400);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ deviceId: string; command: string }> },
) {
  try {
    const { deviceId, command } = await context.params;
    const commandRoute = commandRouteSegmentSchema.parse(command);
    const requestBody = await readJsonBody(request);
    const config = commandRouteConfig[commandRoute];
    const payload = config.bodySchema.parse(requestBody);

    const result = await publishDeviceCommand({
      deviceId,
      command: config.command,
      payload,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid command payload",
          details: z.flattenError(error),
        },
        { status: 400 },
      );
    }

    if (error instanceof PublishDeviceCommandError) {
      return Response.json(
        {
          error: error.message,
        },
        { status: error.statusCode },
      );
    }

    console.error("[api] Failed to publish device command", error);

    return Response.json(
      {
        error: "Unexpected command publish failure",
      },
      { status: 500 },
    );
  }
}

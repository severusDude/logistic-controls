import { commandRouteConfig, type CommandRouteSegment } from "@/lib/backend/schemas/cmd";

export type DeviceCommandResponse = {
  deviceId: string;
  topic: string;
  commandId: string;
  command: string;
  status: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export class CommandClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "CommandClientError";
  }
}

function buildCommandEndpoint(deviceId: string, command: CommandRouteSegment) {
  return `/api/devices/${encodeURIComponent(deviceId)}/commands/${command}`;
}

async function readErrorResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return { message: response.statusText || "Command request failed" };
  }

  try {
    const data = JSON.parse(text) as { error?: string; details?: unknown };
    return {
      message: data.error ?? (response.statusText || "Command request failed"),
      details: data.details,
    };
  } catch {
    return {
      message: text,
    };
  }
}

export async function submitDeviceCommand<TCommand extends CommandRouteSegment>(
  deviceId: string,
  command: TCommand,
  body: unknown,
) {
  const config = commandRouteConfig[command];
  const parsedBody = config.bodySchema.parse(body);
  const response = await fetch(buildCommandEndpoint(deviceId, command), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsedBody),
  });

  if (!response.ok) {
    const error = await readErrorResponse(response);
    throw new CommandClientError(error.message, response.status, error.details);
  }

  return (await response.json()) as DeviceCommandResponse;
}

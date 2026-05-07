import { randomUUID } from "node:crypto";
import {
  CommandStatus,
  DeviceType,
  Prisma,
  RawEventType,
} from "@/generated/prisma/client";
import { prisma } from "../db/prisma";
import { publishMqttMessage } from "../mqtt/publisher";
import {
  type DeviceCommand,
  mqttCommandEnvelopeSchema,
} from "../schemas/cmd";
import { persistRawEvent } from "../processors/raw-events";

const COMMAND_QOS = 2 as const;

export class PublishDeviceCommandError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "PublishDeviceCommandError";
  }
}

type PublishDeviceCommandInput = {
  deviceId: string;
  command: DeviceCommand;
  payload: Record<string, unknown>;
};

function buildCommandId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomUUID().slice(0, 8).toUpperCase();
  return `CMD-${date}-${suffix}`;
}

export async function publishDeviceCommand(input: PublishDeviceCommandInput) {
  const device = await prisma.device.findUnique({
    where: { deviceId: input.deviceId },
    select: {
      id: true,
      deviceId: true,
      deviceType: true,
    },
  });

  if (!device) {
    throw new PublishDeviceCommandError("Device not found", 404);
  }

  if (device.deviceType !== DeviceType.mobile) {
    throw new PublishDeviceCommandError(
      "MQTT command publishing only supports mobile devices right now",
      400,
    );
  }

  const commandId = buildCommandId();
  const envelope = mqttCommandEnvelopeSchema.parse({
    command: input.command,
    command_id: commandId,
    payload: input.payload,
  });
  const topic = `logistics/mobile/${device.deviceId}/cmd`;

  const commandRecord = await prisma.deviceCommand.create({
    data: {
      commandId,
      deviceId: device.id,
      command: input.command,
      payload: envelope.payload as Prisma.InputJsonValue,
      status: CommandStatus.queued,
    },
  });

  try {
    await publishMqttMessage({
      topic,
      payload: JSON.stringify(envelope),
      qos: COMMAND_QOS,
      retain: false,
    });

    const updatedRecord = await prisma.deviceCommand.update({
      where: { id: commandRecord.id },
      data: {
        status: CommandStatus.published,
      },
    });

    try {
      await persistRawEvent({
        topic,
        deviceId: device.deviceId,
        eventType: RawEventType.cmd,
        qos: COMMAND_QOS,
        retain: false,
        payload: envelope,
      });
    } catch (error) {
      console.error("[commands] Failed to persist published MQTT command", error);
    }

    return {
      deviceId: device.deviceId,
      topic,
      commandId: updatedRecord.commandId,
      command: updatedRecord.command,
      status: updatedRecord.status,
      payload: envelope.payload,
      createdAt: updatedRecord.createdAt,
      updatedAt: updatedRecord.updatedAt,
    };
  } catch (error) {
    await prisma.deviceCommand.update({
      where: { id: commandRecord.id },
      data: {
        status: CommandStatus.failed,
      },
    });

    throw new PublishDeviceCommandError("MQTT publish failed", 502, error);
  }
}

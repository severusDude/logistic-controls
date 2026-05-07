export type TopicType = "telemetry" | "scan" | "heartbeat";

export type ParsedTopic = {
  namespace: "mobile";
  deviceId: string;
  topicType: TopicType;
};

const topicPattern =
  /^logistics\/mobile\/([^/]+)\/(telemetry|scan|heartbeat)$/;

export function parseMobileTopic(topic: string): ParsedTopic | null {
  const match = topicPattern.exec(topic);

  if (!match) {
    return null;
  }

  return {
    namespace: "mobile",
    deviceId: match[1],
    topicType: match[2] as TopicType,
  };
}

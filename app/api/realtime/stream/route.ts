import {
  getRealtimeSnapshot,
  getRealtimeWatermarks,
  hasWatermarkChanges,
} from "@/lib/backend/realtime/snapshot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();

function encodeSseEvent(event: string, payload: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

function encodeKeepalive() {
  return encoder.encode(`: keepalive ${Date.now()}\n\n`);
}

export async function GET(request: Request) {
  const initialSnapshot = await getRealtimeSnapshot();
  let latestWatermarks = initialSnapshot.watermarks;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let polling = false;

      const cleanup = () => {
        if (closed) {
          return;
        }

        closed = true;
        clearInterval(pollInterval);
        clearInterval(keepaliveInterval);
        request.signal.removeEventListener("abort", handleAbort);
        controller.close();
      };

      const safeEnqueue = (chunk: Uint8Array) => {
        if (!closed) {
          controller.enqueue(chunk);
        }
      };

      const handleAbort = () => {
        cleanup();
      };

      safeEnqueue(encodeSseEvent("snapshot", initialSnapshot));

      const pollInterval = setInterval(() => {
        if (polling || closed) {
          return;
        }

        polling = true;
        void (async () => {
          try {
            const nextWatermarks = await getRealtimeWatermarks();

            if (!hasWatermarkChanges(latestWatermarks, nextWatermarks)) {
              return;
            }

            const snapshot = await getRealtimeSnapshot();
            latestWatermarks = snapshot.watermarks;
            safeEnqueue(encodeSseEvent("snapshot", snapshot));
          } catch (error) {
            safeEnqueue(
              encodeSseEvent("error", {
                message: error instanceof Error ? error.message : "Realtime stream failed",
              }),
            );
          } finally {
            polling = false;
          }
        })();
      }, 2_000);

      const keepaliveInterval = setInterval(() => {
        safeEnqueue(encodeKeepalive());
      }, 15_000);

      request.signal.addEventListener("abort", handleAbort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

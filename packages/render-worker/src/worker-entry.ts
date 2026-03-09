import type { RenderWorkerEvent, RenderWorkerRequest } from "@ray2/render-scene";

import { createWorkerMessageHandler } from "./message-handler";

interface WorkerScopeLike {
  postMessage(message: RenderWorkerEvent): void;
  onmessage: ((message: MessageEvent<RenderWorkerRequest>) => void) | null;
}

declare const self: WorkerScopeLike;

export function startRenderWorker(
  workerScope: WorkerScopeLike = self,
): void {
  const handler = createWorkerMessageHandler((event: RenderWorkerEvent) => {
    workerScope.postMessage(event);
  });

  workerScope.onmessage = (message: MessageEvent<RenderWorkerRequest>) => {
    void handler.handleMessage(message.data);
  };
}

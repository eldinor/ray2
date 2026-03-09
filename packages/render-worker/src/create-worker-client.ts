import type {
  RenderWorkerEvent,
  RenderWorkerRequest,
} from "@ray2/render-scene";
import type {
  RenderWorkerClient,
  WorkerEventSource,
  WorkerEventSubscription,
} from "@ray2/renderer-controller";

export interface RenderWorkerClientHandle
  extends RenderWorkerClient,
    WorkerEventSource {
  dispose(): void;
}

export function createRenderWorkerClient(worker: Worker): RenderWorkerClientHandle {
  return {
    async loadScene(scene, settings, referenceWidth, referenceHeight) {
      const message: RenderWorkerRequest = {
        type: "loadScene",
        scene,
        settings,
        referenceWidth,
        referenceHeight,
      };

      worker.postMessage(message);
    },
    async startRender(settings) {
      const message: RenderWorkerRequest = {
        type: "startRender",
        settings,
      };

      worker.postMessage(message);
    },
    async reset() {
      const message: RenderWorkerRequest = {
        type: "reset",
      };

      worker.postMessage(message);
    },
    subscribe(listener): WorkerEventSubscription {
      const handleMessage = (event: MessageEvent<RenderWorkerEvent>) => {
        listener(event.data);
      };

      worker.addEventListener("message", handleMessage);

      return {
        dispose() {
          worker.removeEventListener("message", handleMessage);
        },
      };
    },
    dispose() {
      const message: RenderWorkerRequest = { type: "dispose" };
      worker.postMessage(message);
      worker.terminate();
    },
  };
}

export function postInitializeMessage(
  worker: Worker,
  canvas?: OffscreenCanvas,
): void {
  const message: RenderWorkerRequest = {
    type: "initialize",
    canvas,
  };

  if (canvas) {
    worker.postMessage(message, [canvas]);
    return;
  }

  worker.postMessage(message);
}

import type {
  RenderWorkerEvent,
  RenderWorkerRequest,
} from "@ray2/render-scene";

import { createInitialWorkerState, type RenderWorkerState } from "./worker-state";
import { initializeWebGpu } from "./webgpu-init";

export interface WorkerMessageHandler {
  handleMessage(message: RenderWorkerRequest): Promise<void>;
  getState(): RenderWorkerState;
}

export function createWorkerMessageHandler(
  emit: (event: RenderWorkerEvent) => void,
): WorkerMessageHandler {
  const state = createInitialWorkerState();

  return {
    async handleMessage(message) {
      try {
        switch (message.type) {
          case "initialize": {
            state.context = await initializeWebGpu(message.canvas);
            emit({ type: "initialized" });
            break;
          }

          case "loadScene": {
            state.currentScene = message.scene;
            state.currentSettings = message.settings;
            state.referenceWidth = message.referenceWidth;
            state.referenceHeight = message.referenceHeight;
            state.sampleCount = 0;
            break;
          }

          case "startRender": {
            state.currentSettings = message.settings;
            state.sampleCount += 1;
            state.startedAtMs ??= Date.now();

            emit({
              type: "progress",
              sampleCount: state.sampleCount,
              elapsedMs: Date.now() - state.startedAtMs,
            });
            emit({ type: "frame" });
            break;
          }

          case "reset": {
            state.currentScene = null;
            state.currentSettings = null;
            state.referenceWidth = 0;
            state.referenceHeight = 0;
            state.sampleCount = 0;
            state.startedAtMs = null;
            break;
          }

          case "dispose": {
            state.context = null;
            state.currentScene = null;
            state.currentSettings = null;
            state.referenceWidth = 0;
            state.referenceHeight = 0;
            state.sampleCount = 0;
            state.startedAtMs = null;
            break;
          }

          default: {
            assertNever(message);
          }
        }
      } catch (error) {
        emit({
          type: "error",
          message: toErrorMessage(error),
        });
      }
    },
    getState() {
      return state;
    },
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled worker message: ${JSON.stringify(value)}`);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown render worker error.";
}

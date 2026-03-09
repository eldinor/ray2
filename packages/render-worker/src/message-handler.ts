import type {
  RenderWorkerEvent,
  RenderWorkerRequest,
} from "@ray2/render-scene";

import {
  createInitialWorkerState,
  type RenderWorkerState,
} from "./worker-state";
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
            state.context?.renderer?.loadScene(message.scene, message.settings);
            break;
          }

          case "startRender": {
            if (!state.currentScene) {
              throw new Error("Cannot start render before a scene is loaded.");
            }

            state.currentSettings = message.settings;
            state.startedAtMs = Date.now();
            stopRenderLoop(state);
            state.renderTimer = setInterval(() => {
              const currentScene = state.currentScene;
              const currentSettings = state.currentSettings;

              if (!currentScene || !currentSettings) {
                return;
              }

              state.sampleCount += 1;
              state.context?.renderer?.renderSample({
                scene: currentScene,
                settings: currentSettings,
                sampleCount: state.sampleCount,
              });

              emit({
                type: "progress",
                sampleCount: state.sampleCount,
                elapsedMs: Date.now() - (state.startedAtMs ?? Date.now()),
              });
              emit({ type: "frame" });
            }, 120) as unknown as number;
            break;
          }

          case "reset": {
            stopRenderLoop(state);
            state.currentScene = null;
            state.currentSettings = null;
            state.referenceWidth = 0;
            state.referenceHeight = 0;
            state.sampleCount = 0;
            state.startedAtMs = null;
            break;
          }

          case "dispose": {
            stopRenderLoop(state);
            state.context?.renderer?.dispose();
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

function stopRenderLoop(state: RenderWorkerState): void {
  if (state.renderTimer !== null) {
    clearInterval(state.renderTimer);
    state.renderTimer = null;
  }
}

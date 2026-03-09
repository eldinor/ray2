import type { RenderScene, RenderSettings } from "@ray2/render-scene";

import type { WebGpuContext } from "./webgpu-init";

export interface RenderWorkerState {
  context: WebGpuContext | null;
  currentScene: RenderScene | null;
  currentSettings: RenderSettings | null;
  referenceWidth: number;
  referenceHeight: number;
  sampleCount: number;
  startedAtMs: number | null;
  renderTimer: number | null;
}

export function createInitialWorkerState(): RenderWorkerState {
  return {
    context: null,
    currentScene: null,
    currentSettings: null,
    referenceWidth: 0,
    referenceHeight: 0,
    sampleCount: 0,
    startedAtMs: null,
    renderTimer: null,
  };
}

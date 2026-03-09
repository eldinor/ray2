import { createProgressiveRenderer } from "../../render-core/src/index";
import type {
  ProgressiveRenderer,
  WebGpuCanvasContextLike,
  WebGpuDeviceLike as RenderCoreDeviceLike,
} from "../../render-core/src/index";

export interface WebGpuContext {
  adapter: WebGpuAdapterLike | null;
  device: WebGpuDeviceLike | null;
  canvas: OffscreenCanvas | null;
  canvasContext: WebGpuCanvasContextLike | null;
  format: string | null;
  renderer: ProgressiveRenderer | null;
}

export interface WebGpuAdapterLike {
  requestDevice(): Promise<WebGpuDeviceLike>;
}

export interface WebGpuDeviceLike extends RenderCoreDeviceLike {
  readonly label?: string;
}

interface NavigatorWithWebGpu {
  gpu?: {
    requestAdapter(): Promise<WebGpuAdapterLike | null>;
    getPreferredCanvasFormat?(): string;
  };
}

export async function initializeWebGpu(
  canvas?: OffscreenCanvas,
): Promise<WebGpuContext> {
  const workerNavigator = navigator as Navigator & NavigatorWithWebGpu;

  if (!workerNavigator.gpu) {
    return {
      adapter: null,
      device: null,
      canvas: canvas ?? null,
      canvasContext: null,
      format: null,
      renderer: null,
    };
  }

  const adapter = (await workerNavigator.gpu.requestAdapter()) ?? null;
  const device = adapter ? await adapter.requestDevice() : null;
  const canvasContext =
    canvas?.getContext("webgpu") as WebGpuCanvasContextLike | null;
  const format =
    workerNavigator.gpu.getPreferredCanvasFormat?.() ?? "bgra8unorm";
  const renderer =
    canvas && canvasContext && device
      ? createProgressiveRenderer({
          canvas,
          context: canvasContext,
          device,
          format,
        })
      : null;

  return {
    adapter,
    device,
    canvas: canvas ?? null,
    canvasContext,
    format,
    renderer,
  };
}

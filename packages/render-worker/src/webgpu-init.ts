export interface WebGpuContext {
  adapter: WebGpuAdapterLike | null;
  device: WebGpuDeviceLike | null;
  canvas: OffscreenCanvas | null;
}

export interface WebGpuAdapterLike {
  requestDevice(): Promise<WebGpuDeviceLike>;
}

export interface WebGpuDeviceLike {
  readonly label?: string;
}

interface NavigatorWithWebGpu extends Navigator {
  gpu?: {
    requestAdapter(): Promise<WebGpuAdapterLike | null>;
  };
}

export async function initializeWebGpu(
  canvas?: OffscreenCanvas,
): Promise<WebGpuContext> {
  const workerNavigator = navigator as NavigatorWithWebGpu;

  if (!workerNavigator.gpu) {
    return {
      adapter: null,
      device: null,
      canvas: canvas ?? null,
    };
  }

  const adapter = await workerNavigator.gpu.requestAdapter();
  const device = adapter ? await adapter.requestDevice() : null;

  return {
    adapter,
    device,
    canvas: canvas ?? null,
  };
}

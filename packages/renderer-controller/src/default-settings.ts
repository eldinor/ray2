import type { RenderSettings } from "@ray2/render-scene";

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
  width: 1280,
  height: 720,
  samples: 1,
  maxBounces: 4,
  fireflyClamp: 10,
  denoiserEnabled: false,
  environmentIntensity: 1,
};

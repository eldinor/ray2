import type { RenderScene } from "./scene";

export interface SnapshotResult {
  scene: RenderScene;
  referenceImage: ImageBitmap | Blob | Uint8Array;
  width: number;
  height: number;
  warnings: string[];
}

export interface RenderSettings {
  width: number;
  height: number;
  samples: number;
  maxBounces: number;
  fireflyClamp?: number;
  exposure?: number;
  tonemapping?: "none" | "reinhard" | "aces";
  denoiserEnabled?: boolean;
  environmentIntensity?: number;
}

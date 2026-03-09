import type { RenderScene } from "./scene";
import type { RenderSettings } from "./settings";

export type RenderWorkerRequest =
  | { type: "initialize"; canvas?: OffscreenCanvas }
  | {
      type: "loadScene";
      scene: RenderScene;
      settings: RenderSettings;
      referenceWidth: number;
      referenceHeight: number;
    }
  | { type: "startRender"; settings: RenderSettings }
  | { type: "reset" }
  | { type: "dispose" };

export type RenderWorkerEvent =
  | { type: "initialized" }
  | { type: "progress"; sampleCount: number; elapsedMs: number }
  | { type: "frame"; bitmap?: ImageBitmap }
  | { type: "error"; message: string };

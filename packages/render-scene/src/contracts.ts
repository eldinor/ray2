import type { RenderSettings, SnapshotResult } from "./settings";

export interface SceneAdapter<TScene> {
  extractSnapshot(scene: TScene): Promise<SnapshotResult> | SnapshotResult;
}

export type PostSnapshotMode = "keep" | "pause" | "dispose";

export interface RendererController {
  render(): Promise<void>;
  reset(): void;
  setRenderSettings(settings: Partial<RenderSettings>): void;
  setPostSnapshotMode(mode: PostSnapshotMode): void;
}

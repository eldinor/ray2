import type { PostSnapshotMode, RenderSettings } from "@ray2/render-scene";

export type ComparisonMode =
  | "babylon-only"
  | "path-tracer-only"
  | "blend"
  | "difference";

export interface ViewerStatsModel {
  sceneLabel: string;
  sampleCount: number;
  elapsedMs: number;
  resolutionLabel: string;
  warnings: string[];
}

export interface ViewerUiModel {
  comparisonMode: ComparisonMode;
  blendFactor: number;
  postSnapshotMode: PostSnapshotMode;
  renderSettings: Pick<RenderSettings, "samples" | "maxBounces" | "width" | "height">;
  stats: ViewerStatsModel;
}

export const DEFAULT_VIEWER_UI_MODEL: ViewerUiModel = {
  comparisonMode: "blend",
  blendFactor: 50,
  postSnapshotMode: "keep",
  renderSettings: {
    samples: 1,
    maxBounces: 4,
    width: 1280,
    height: 720,
  },
  stats: {
    sceneLabel: "No scene loaded",
    sampleCount: 0,
    elapsedMs: 0,
    resolutionLabel: "1280 x 720",
    warnings: ["Renderer pipeline not connected yet."],
  },
};

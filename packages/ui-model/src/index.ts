import type { PostSnapshotMode, RenderSettings } from "@ray2/render-scene";

export type ExampleSceneId = "simple-box" | "pbr-spheres" | "glb-barrel";

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
  exampleSceneId: ExampleSceneId;
  comparisonMode: ComparisonMode;
  blendFactor: number;
  postSnapshotMode: PostSnapshotMode;
  renderSettings: Pick<
    RenderSettings,
    "samples" | "maxBounces" | "width" | "height" | "fireflyClamp" | "exposure" | "tonemapping"
  >;
  stats: ViewerStatsModel;
}

export const DEFAULT_VIEWER_UI_MODEL: ViewerUiModel = {
  exampleSceneId: "simple-box",
  comparisonMode: "blend",
  blendFactor: 50,
  postSnapshotMode: "keep",
  renderSettings: {
    samples: 1,
    maxBounces: 4,
    width: 1280,
    height: 720,
    fireflyClamp: 10,
    exposure: 1,
    tonemapping: "aces",
  },
  stats: {
    sceneLabel: "Simple box",
    sampleCount: 0,
    elapsedMs: 0,
    resolutionLabel: "1280 x 720",
    warnings: ["Select an example scene and render it through the worker pipeline."],
  },
};

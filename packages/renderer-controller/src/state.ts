import type {
  PostSnapshotMode,
  RenderSettings,
  SnapshotResult,
} from "@ray2/render-scene";

export type SceneLifecycleState = "live" | "paused" | "disposed";

export interface RendererControllerState {
  renderSettings: RenderSettings;
  postSnapshotMode: PostSnapshotMode;
  sceneLifecycleState: SceneLifecycleState;
  isRendering: boolean;
  lastSnapshot: SnapshotResult | null;
  lastError: string | null;
}

export type RendererControllerListener = (
  state: RendererControllerState,
) => void;

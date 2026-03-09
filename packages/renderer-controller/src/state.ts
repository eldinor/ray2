import type {
  PostSnapshotMode,
  RenderSettings,
  SnapshotResult,
} from "@ray2/render-scene";

export interface RendererControllerState {
  renderSettings: RenderSettings;
  postSnapshotMode: PostSnapshotMode;
  isRendering: boolean;
  lastSnapshot: SnapshotResult | null;
  lastError: string | null;
}

export type RendererControllerListener = (
  state: RendererControllerState,
) => void;

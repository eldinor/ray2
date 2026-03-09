import type {
  PostSnapshotMode,
  RenderSettings,
  RendererController,
  SceneAdapter,
  SnapshotResult,
} from "@ray2/render-scene";

import { DEFAULT_RENDER_SETTINGS } from "./default-settings";
import type {
  RenderWorkerClient,
  SceneLifecycleController,
  WorkerEventSource,
} from "./ports";
import type {
  RendererControllerListener,
  RendererControllerState,
} from "./state";

export interface CreateRendererControllerOptions<TScene> {
  scene: TScene;
  adapter: SceneAdapter<TScene>;
  workerClient: RenderWorkerClient;
  workerEvents?: WorkerEventSource;
  lifecycleController?: SceneLifecycleController<TScene>;
  initialSettings?: Partial<RenderSettings>;
  initialPostSnapshotMode?: PostSnapshotMode;
}

export interface RendererControllerHandle extends RendererController {
  getState(): RendererControllerState;
  subscribe(listener: RendererControllerListener): () => void;
}

export class DefaultRendererController<TScene>
  implements RendererControllerHandle
{
  private readonly adapter: SceneAdapter<TScene>;
  private readonly lifecycleController?: SceneLifecycleController<TScene>;
  private readonly listeners = new Set<RendererControllerListener>();
  private readonly scene: TScene;
  private readonly workerClient: RenderWorkerClient;
  private state: RendererControllerState;

  constructor(options: CreateRendererControllerOptions<TScene>) {
    this.scene = options.scene;
    this.adapter = options.adapter;
    this.workerClient = options.workerClient;
    this.lifecycleController = options.lifecycleController;
      this.state = {
        renderSettings: {
          ...DEFAULT_RENDER_SETTINGS,
          ...options.initialSettings,
        },
        postSnapshotMode: options.initialPostSnapshotMode ?? "keep",
        sceneLifecycleState: "live",
        isRendering: false,
        lastSnapshot: null,
        lastError: null,
      };

    options.workerEvents?.subscribe((event) => {
      if (event.type === "error") {
        this.updateState({
          isRendering: false,
          lastError: event.message,
        });
      }
    });
  }

  getState(): RendererControllerState {
    return this.state;
  }

  subscribe(listener: RendererControllerListener): () => void {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async render(): Promise<void> {
    this.updateState({
      isRendering: true,
      lastError: null,
    });

    try {
      await this.prepareSceneForSnapshot();
      const snapshot = await this.adapter.extractSnapshot(this.scene);

      this.updateState({
        lastSnapshot: snapshot,
      });

      await this.applyPostSnapshotMode();
      await this.loadSnapshot(snapshot);
      await this.workerClient.startRender(this.state.renderSettings);
    } catch (error) {
      this.updateState({
        lastError: toErrorMessage(error),
        isRendering: false,
      });

      throw error;
    }
  }

  reset(): void {
    this.workerClient.reset();
    void this.lifecycleController?.resume?.(this.scene);
    this.updateState({
      sceneLifecycleState: "live",
      isRendering: false,
      lastError: null,
    });
  }

  setRenderSettings(settings: Partial<RenderSettings>): void {
    this.updateState({
      renderSettings: {
        ...this.state.renderSettings,
        ...settings,
      },
    });
  }

  setPostSnapshotMode(mode: PostSnapshotMode): void {
    this.updateState({
      postSnapshotMode: mode,
    });
  }

  private async prepareSceneForSnapshot(): Promise<void> {
    await this.lifecycleController?.resume?.(this.scene);
    this.updateState({
      sceneLifecycleState: "live",
    });
  }

  private async applyPostSnapshotMode(): Promise<void> {
    if (this.state.postSnapshotMode === "pause") {
      await this.lifecycleController?.pause?.(this.scene);
      this.updateState({
        sceneLifecycleState: "paused",
      });
      return;
    }

    if (this.state.postSnapshotMode === "dispose") {
      await this.lifecycleController?.dispose?.(this.scene);
      this.updateState({
        sceneLifecycleState: "disposed",
      });
      return;
    }

    this.updateState({
      sceneLifecycleState: "live",
    });
  }

  private async loadSnapshot(snapshot: SnapshotResult): Promise<void> {
    await this.workerClient.loadScene(
      snapshot.scene,
      this.state.renderSettings,
      snapshot.width,
      snapshot.height,
    );
  }

  private updateState(
    partialState: Partial<RendererControllerState>,
  ): void {
    this.state = {
      ...this.state,
      ...partialState,
    };

    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export function createRendererController<TScene>(
  options: CreateRendererControllerOptions<TScene>,
): RendererControllerHandle {
  return new DefaultRendererController(options);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown renderer controller error.";
}

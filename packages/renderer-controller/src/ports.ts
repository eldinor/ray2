import type { RenderScene, RenderSettings, RenderWorkerEvent } from "@ray2/render-scene";

export interface RenderWorkerClient {
  loadScene(
    scene: RenderScene,
    settings: RenderSettings,
    referenceWidth: number,
    referenceHeight: number,
  ): Promise<void>;
  startRender(settings: RenderSettings): Promise<void>;
  reset(): Promise<void> | void;
}

export interface SceneLifecycleController<TScene> {
  resume?(scene: TScene): Promise<void> | void;
  pause?(scene: TScene): Promise<void> | void;
  dispose?(scene: TScene): Promise<void> | void;
}

export interface WorkerEventSubscription {
  dispose(): void;
}

export interface WorkerEventSource {
  subscribe(
    listener: (event: RenderWorkerEvent) => void,
  ): WorkerEventSubscription;
}

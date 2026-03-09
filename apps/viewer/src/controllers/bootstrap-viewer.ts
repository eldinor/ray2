import type {
  PostSnapshotMode,
  RenderSettings,
  RenderWorkerEvent,
  SceneAdapter,
  SnapshotResult,
} from "@ray2/render-scene";
import { createRenderWorkerClient, postInitializeMessage } from "@ray2/render-worker";
import { createRendererController } from "@ray2/renderer-controller";
import {
  DEFAULT_VIEWER_UI_MODEL,
  type ComparisonMode,
  type ExampleSceneId,
  type ViewerUiModel,
} from "@ray2/ui-model";

import {
  EXAMPLE_SCENE_PRESETS,
  createExampleSnapshot,
} from "../examples/example-scenes";
import { createToolbar, type ToolbarRefs } from "../ui/create-toolbar";
import {
  createViewportPanel,
  type ViewportPanelRefs,
} from "../ui/create-viewport-panel";

interface ViewerDomRefs {
  shell: HTMLElement;
  topbarStatus: HTMLElement;
  toolbar: ToolbarRefs;
  viewport: ViewportPanelRefs;
}

interface DemoSceneState {
  selectedSceneId: ExampleSceneId;
  viewportElement: HTMLElement;
  lifecycleState: "live" | "paused" | "disposed";
}

export function bootstrapViewer(): HTMLElement {
  const uiModel: ViewerUiModel = structuredClone(DEFAULT_VIEWER_UI_MODEL);
  const dom = createViewerLayout(uiModel);
  const sceneState: DemoSceneState = {
    selectedSceneId: uiModel.exampleSceneId,
    viewportElement: dom.viewport.viewportSurface,
    lifecycleState: "live",
  };
  const worker = new Worker(new URL("../workers/render-worker.ts", import.meta.url), {
    type: "module",
  });
  const workerClient = createRenderWorkerClient(worker);
  const controller = createRendererController({
    scene: sceneState,
    adapter: createDemoSceneAdapter(),
    workerClient,
    workerEvents: workerClient,
    lifecycleController: {
      resume(scene) {
        scene.lifecycleState = "live";
      },
      pause(scene) {
        scene.lifecycleState = "paused";
      },
      dispose(scene) {
        scene.lifecycleState = "disposed";
      },
    },
  });

  if ("transferControlToOffscreen" in dom.viewport.renderCanvas) {
    const offscreenCanvas = dom.viewport.renderCanvas.transferControlToOffscreen();
    postInitializeMessage(worker, offscreenCanvas);
  } else {
    postInitializeMessage(worker);
    uiModel.stats.warnings = [
      "OffscreenCanvas is unavailable. Worker render output is disabled.",
    ];
  }

  let currentComparisonMode = uiModel.comparisonMode;
  let currentBlendFactor = uiModel.blendFactor;
  let latestElapsedMs = 0;
  let latestSampleCount = 0;
  let referenceImageUrl: string | null = null;

  const syncViewportSize = (): void => {
    const rect = dom.viewport.viewportSurface.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    controller.setRenderSettings({ width, height });
    uiModel.renderSettings.width = width;
    uiModel.renderSettings.height = height;
    uiModel.stats.resolutionLabel = `${width} x ${height}`;

    updateToolbarNumericFields(dom.toolbar, uiModel.renderSettings);
    renderUiState();
  };

  const resizeObserver = new ResizeObserver(() => {
    syncViewportSize();
  });
  resizeObserver.observe(dom.viewport.viewportSurface);

  controller.subscribe((state) => {
    uiModel.postSnapshotMode = state.postSnapshotMode;
    uiModel.exampleSceneId = sceneState.selectedSceneId;
    uiModel.renderSettings.samples = state.renderSettings.samples;
    uiModel.renderSettings.maxBounces = state.renderSettings.maxBounces;
    uiModel.renderSettings.width = state.renderSettings.width;
    uiModel.renderSettings.height = state.renderSettings.height;
    uiModel.renderSettings.fireflyClamp = state.renderSettings.fireflyClamp;
    uiModel.renderSettings.exposure = state.renderSettings.exposure;
    uiModel.renderSettings.tonemapping = state.renderSettings.tonemapping;
    uiModel.stats.sceneLabel = EXAMPLE_SCENE_PRESETS[sceneState.selectedSceneId].label;
    uiModel.stats.resolutionLabel = `${state.renderSettings.width} x ${state.renderSettings.height}`;

    const snapshotWarnings = state.lastSnapshot?.warnings ?? [];
    const workerStatus = formatLifecycleWarning(
      state.sceneLifecycleState,
      state.postSnapshotMode,
    );
    const errorWarnings = state.lastError ? [state.lastError] : [];

    uiModel.stats.warnings = [
      workerStatus,
      ...snapshotWarnings,
      ...errorWarnings,
    ].slice(0, 6);

    dom.topbarStatus.textContent = state.isRendering ? "Rendering" : "Idle";
    dom.viewport.sceneValue.textContent = uiModel.stats.sceneLabel;
    dom.viewport.samplesValue.textContent = `${latestSampleCount}`;
    dom.viewport.elapsedValue.textContent = `${latestElapsedMs} ms`;
    dom.viewport.resolutionValue.textContent = uiModel.stats.resolutionLabel;
    dom.toolbar.exampleSceneSelect.value = uiModel.exampleSceneId;
    syncPostSnapshotSelect(dom.toolbar, state.postSnapshotMode);
    syncReferenceImage(dom.viewport, state.lastSnapshot?.referenceImage ?? null);
    renderWarnings(dom.viewport, uiModel.stats.warnings);
    renderViewportMessage(dom.viewport, state, currentComparisonMode, currentBlendFactor);
    renderComparisonMode(dom.viewport, currentComparisonMode, currentBlendFactor);
  });

  workerClient.subscribe((event) => {
    handleWorkerEvent(event);
    renderUiState();
  });

  dom.toolbar.renderButton.addEventListener("click", () => {
    void controller.render();
  });

  dom.toolbar.resetButton.addEventListener("click", () => {
    latestElapsedMs = 0;
    latestSampleCount = 0;
    controller.reset();
    syncReferenceImage(dom.viewport, null);
    renderUiState();
  });

  dom.toolbar.exampleSceneSelect.addEventListener("change", () => {
    sceneState.selectedSceneId = dom.toolbar.exampleSceneSelect.value as ExampleSceneId;
    uiModel.exampleSceneId = sceneState.selectedSceneId;
    latestElapsedMs = 0;
    latestSampleCount = 0;
    controller.reset();
    syncReferenceImage(dom.viewport, null);
    renderUiState();
  });

  dom.toolbar.comparisonModeSelect.addEventListener("change", () => {
    currentComparisonMode = dom.toolbar.comparisonModeSelect
      .value as ComparisonMode;
    uiModel.comparisonMode = currentComparisonMode;
    dom.viewport.modeBadge.textContent = formatModeLabel(currentComparisonMode);
    renderUiState();
  });

  dom.toolbar.blendSlider.addEventListener("input", () => {
    currentBlendFactor = Number(dom.toolbar.blendSlider.value);
    uiModel.blendFactor = currentBlendFactor;
    dom.toolbar.blendValue.textContent = `${currentBlendFactor}%`;
    renderUiState();
  });

  dom.toolbar.postSnapshotModeSelect.addEventListener("change", () => {
    const mode = dom.toolbar.postSnapshotModeSelect.value as PostSnapshotMode;
    controller.setPostSnapshotMode(mode);
  });

  dom.toolbar.samplesInput.addEventListener("change", () => {
    controller.setRenderSettings({
      samples: sanitizePositiveInteger(dom.toolbar.samplesInput.value, 1),
    });
  });

  dom.toolbar.maxBouncesInput.addEventListener("change", () => {
    controller.setRenderSettings({
      maxBounces: sanitizePositiveInteger(dom.toolbar.maxBouncesInput.value, 1),
    });
  });

  dom.toolbar.fireflyClampInput.addEventListener("change", () => {
    controller.setRenderSettings({
      fireflyClamp: sanitizeFloat(dom.toolbar.fireflyClampInput.value, 10, 0),
    });
  });

  dom.toolbar.exposureInput.addEventListener("change", () => {
    controller.setRenderSettings({
      exposure: sanitizeFloat(dom.toolbar.exposureInput.value, 1, 0.1),
    });
  });

  dom.toolbar.tonemappingSelect.addEventListener("change", () => {
    controller.setRenderSettings({
      tonemapping: dom.toolbar.tonemappingSelect.value as RenderSettings["tonemapping"],
    });
  });

  syncViewportSize();
  renderUiState();

  return dom.shell;

  function handleWorkerEvent(event: RenderWorkerEvent): void {
    switch (event.type) {
      case "initialized":
        uiModel.stats.warnings = ["Render worker initialized."];
        break;
      case "progress":
        latestSampleCount = event.sampleCount;
        latestElapsedMs = event.elapsedMs;
        break;
      case "frame":
        break;
      case "error":
        uiModel.stats.warnings = [event.message];
        break;
    }
  }

  function renderUiState(): void {
    dom.viewport.modeBadge.textContent = formatModeLabel(currentComparisonMode);
    dom.toolbar.blendValue.textContent = `${currentBlendFactor}%`;
    dom.viewport.samplesValue.textContent = `${latestSampleCount}`;
    dom.viewport.elapsedValue.textContent = `${latestElapsedMs} ms`;
    dom.viewport.resolutionValue.textContent = uiModel.stats.resolutionLabel;
    dom.viewport.sceneValue.textContent = uiModel.stats.sceneLabel;
    renderWarnings(dom.viewport, uiModel.stats.warnings);
    renderViewportMessage(
      dom.viewport,
      controller.getState(),
      currentComparisonMode,
      currentBlendFactor,
    );
    renderComparisonMode(dom.viewport, currentComparisonMode, currentBlendFactor);
  }

  function syncReferenceImage(
    viewport: ViewportPanelRefs,
    referenceImage: SnapshotResult["referenceImage"] | null,
  ): void {
    if (referenceImageUrl) {
      URL.revokeObjectURL(referenceImageUrl);
      referenceImageUrl = null;
    }

    const blob = referenceImage ? toReferenceBlob(referenceImage) : null;

    if (!blob) {
      viewport.referenceImage.removeAttribute("src");
      return;
    }

    referenceImageUrl = URL.createObjectURL(blob);
    viewport.referenceImage.src = referenceImageUrl;
  }
}

function createViewerLayout(model: ViewerUiModel): ViewerDomRefs {
  const shell = document.createElement("main");
  shell.className = "app-shell";

  const topbar = document.createElement("header");
  topbar.className = "topbar";

  const status = document.createElement("p");
  status.className = "status-pill";
  status.textContent = "Idle";

  topbar.innerHTML = `
    <div>
      <p class="eyebrow">Ray2</p>
      <h1 class="title">Unified viewport shell</h1>
    </div>
  `;
  topbar.append(status);

  const workspace = document.createElement("section");
  workspace.className = "workspace";

  const toolbar = createToolbar(model);
  const viewport = createViewportPanel(model);

  workspace.append(toolbar.root, viewport.root);
  shell.append(topbar, workspace);

  return {
    shell,
    topbarStatus: status,
    toolbar,
    viewport,
  };
}

function createDemoSceneAdapter(): SceneAdapter<DemoSceneState> {
  return {
    async extractSnapshot(scene): Promise<SnapshotResult> {
      const rect = scene.viewportElement.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      return createExampleSnapshot(scene.selectedSceneId, width, height);
    },
  };
}

function sanitizePositiveInteger(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sanitizeFloat(value: string, fallback: number, minimum: number): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= minimum ? parsed : fallback;
}

function renderWarnings(
  viewport: ViewportPanelRefs,
  warnings: string[],
): void {
  viewport.warningList.innerHTML = warnings
    .map((warning) => `<li>${warning}</li>`)
    .join("");
}

function syncPostSnapshotSelect(
  toolbar: ToolbarRefs,
  mode: PostSnapshotMode,
): void {
  toolbar.postSnapshotModeSelect.value = mode;
}

function updateToolbarNumericFields(
  toolbar: ToolbarRefs,
  settings: Pick<
    RenderSettings,
    "samples" | "maxBounces" | "width" | "height" | "fireflyClamp" | "exposure" | "tonemapping"
  >,
): void {
  toolbar.samplesInput.value = `${settings.samples}`;
  toolbar.maxBouncesInput.value = `${settings.maxBounces}`;
  toolbar.widthInput.value = `${settings.width}`;
  toolbar.heightInput.value = `${settings.height}`;
  toolbar.fireflyClampInput.value = `${settings.fireflyClamp ?? 10}`;
  toolbar.exposureInput.value = `${settings.exposure ?? 1}`;
  toolbar.tonemappingSelect.value = settings.tonemapping ?? "aces";
}

function renderViewportMessage(
  viewport: ViewportPanelRefs,
  state: ReturnType<
    ReturnType<typeof createRendererController<DemoSceneState>>["getState"]
  >,
  comparisonMode: ComparisonMode,
  blendFactor: number,
): void {
  const base = state.lastSnapshot
    ? `Snapshot ready at ${state.lastSnapshot.width} x ${state.lastSnapshot.height}.`
    : "Render click will capture a snapshot and send it to the worker.";

  const modeText =
    comparisonMode === "blend"
      ? `Blend preview set to ${blendFactor}%.`
      : `${formatModeLabel(comparisonMode)} mode selected.`;

  viewport.viewportMessage.textContent = `${base} ${modeText}`;
}

function renderComparisonMode(
  viewport: ViewportPanelRefs,
  comparisonMode: ComparisonMode,
  blendFactor: number,
): void {
  const renderAlpha = Math.max(0, Math.min(1, blendFactor / 100));
  const hasReference = viewport.referenceImage.hasAttribute("src");

  viewport.placeholderOverlay.style.opacity = hasReference ? "0" : "1";
  viewport.referenceImage.style.mixBlendMode = "normal";
  viewport.renderCanvas.style.mixBlendMode = "normal";

  switch (comparisonMode) {
    case "babylon-only":
      viewport.referenceImage.style.opacity = "1";
      viewport.renderCanvas.style.opacity = "0";
      break;
    case "path-tracer-only":
      viewport.referenceImage.style.opacity = "0";
      viewport.renderCanvas.style.opacity = "1";
      break;
    case "blend":
      viewport.referenceImage.style.opacity = "1";
      viewport.renderCanvas.style.opacity = `${renderAlpha}`;
      break;
    case "difference":
      viewport.referenceImage.style.opacity = "1";
      viewport.renderCanvas.style.opacity = "1";
      viewport.renderCanvas.style.mixBlendMode = "difference";
      break;
  }
}

function toReferenceBlob(
  referenceImage: SnapshotResult["referenceImage"],
): Blob | null {
  if (referenceImage instanceof Blob) {
    return referenceImage;
  }

  if (referenceImage instanceof Uint8Array) {
    return new Blob([new Uint8Array(referenceImage)]);
  }

  return null;
}
function formatModeLabel(mode: ComparisonMode): string {
  switch (mode) {
    case "babylon-only":
      return "Babylon only";
    case "path-tracer-only":
      return "Path tracer only";
    case "blend":
      return "Blend";
    case "difference":
      return "Difference";
  }
}

function formatLifecycleWarning(
  lifecycleState: "live" | "paused" | "disposed",
  postSnapshotMode: PostSnapshotMode,
): string {
  switch (lifecycleState) {
    case "live":
      return postSnapshotMode === "keep"
        ? "Scene kept live after snapshot."
        : "Scene restored and ready for the next snapshot.";
    case "paused":
      return "Scene paused after snapshot.";
    case "disposed":
      return "Scene disposed after snapshot.";
  }
}

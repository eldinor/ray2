import type { ViewerUiModel } from "@ray2/ui-model";

export interface ViewportPanelRefs {
  root: HTMLElement;
  modeBadge: HTMLElement;
  viewportSurface: HTMLElement;
  sourceCanvas: HTMLCanvasElement;
  renderCanvas: HTMLCanvasElement;
  referenceImage: HTMLImageElement;
  placeholderOverlay: HTMLElement;
  viewportMessage: HTMLElement;
  sceneValue: HTMLElement;
  samplesValue: HTMLElement;
  elapsedValue: HTMLElement;
  resolutionValue: HTMLElement;
  warningList: HTMLElement;
}

export function createViewportPanel(model: ViewerUiModel): ViewportPanelRefs {
  const panel = document.createElement("section");
  panel.className = "viewport-shell";

  panel.innerHTML = `
    <div class="viewport-stage">
      <div class="viewport-overlay">
        <div>
          <p class="panel-kicker">Viewport</p>
          <h2>Unified comparison canvas</h2>
        </div>
        <div class="mode-badge" data-role="mode-badge">${formatModeLabel(model.comparisonMode)}</div>
      </div>
      <div class="viewport-grid">
        <div class="viewport-frame" data-role="viewport-surface">
          <canvas class="viewport-source-canvas" data-role="source-canvas" aria-hidden="true"></canvas>
          <img class="viewport-reference" data-role="reference-image" alt="Reference render" />
          <canvas class="viewport-canvas" data-role="render-canvas"></canvas>
          <div class="viewport-placeholder" data-role="placeholder-overlay">
            <p data-role="viewport-message">Babylon reference and path tracer output will share this viewport.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <span>Scene</span>
        <strong data-role="scene-value">${model.stats.sceneLabel}</strong>
      </article>
      <article class="stat-card">
        <span>Samples</span>
        <strong data-role="samples-value">${model.stats.sampleCount}</strong>
      </article>
      <article class="stat-card">
        <span>Elapsed</span>
        <strong data-role="elapsed-value">${model.stats.elapsedMs} ms</strong>
      </article>
      <article class="stat-card">
        <span>Resolution</span>
        <strong data-role="resolution-value">${model.stats.resolutionLabel}</strong>
      </article>
    </div>

    <section class="panel-card warnings-card">
      <div class="panel-heading">
        <div>
          <p class="panel-kicker">Status</p>
          <h2>Warnings</h2>
        </div>
      </div>
      <ul class="warning-list" data-role="warning-list">
        ${model.stats.warnings.map((warning) => `<li>${warning}</li>`).join("")}
      </ul>
    </section>
  `;

  return {
    root: panel,
    modeBadge: requireElement(panel, '[data-role="mode-badge"]'),
    viewportSurface: requireElement(panel, '[data-role="viewport-surface"]'),
    sourceCanvas: requireElement(panel, '[data-role="source-canvas"]'),
    renderCanvas: requireElement(panel, '[data-role="render-canvas"]'),
    referenceImage: requireElement(panel, '[data-role="reference-image"]'),
    placeholderOverlay: requireElement(panel, '[data-role="placeholder-overlay"]'),
    viewportMessage: requireElement(panel, '[data-role="viewport-message"]'),
    sceneValue: requireElement(panel, '[data-role="scene-value"]'),
    samplesValue: requireElement(panel, '[data-role="samples-value"]'),
    elapsedValue: requireElement(panel, '[data-role="elapsed-value"]'),
    resolutionValue: requireElement(panel, '[data-role="resolution-value"]'),
    warningList: requireElement(panel, '[data-role="warning-list"]'),
  };
}

function formatModeLabel(mode: ViewerUiModel["comparisonMode"]): string {
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

function requireElement<TElement extends Element>(
  root: ParentNode,
  selector: string,
): TElement {
  const element = root.querySelector<TElement>(selector);

  if (!element) {
    throw new Error(`Expected viewport element "${selector}".`);
  }

  return element;
}

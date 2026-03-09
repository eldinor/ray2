import type { ViewerUiModel } from "@ray2/ui-model";

export function createViewportPanel(model: ViewerUiModel): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "viewport-shell";

  panel.innerHTML = `
    <div class="viewport-stage">
      <div class="viewport-overlay">
        <div>
          <p class="panel-kicker">Viewport</p>
          <h2>Unified comparison canvas</h2>
        </div>
        <div class="mode-badge">${formatModeLabel(model.comparisonMode)}</div>
      </div>
      <div class="viewport-grid">
        <div class="viewport-frame">
          <div class="viewport-placeholder">
            <p>Babylon reference and path tracer output will share this viewport.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <span>Scene</span>
        <strong>${model.stats.sceneLabel}</strong>
      </article>
      <article class="stat-card">
        <span>Samples</span>
        <strong>${model.stats.sampleCount}</strong>
      </article>
      <article class="stat-card">
        <span>Elapsed</span>
        <strong>${model.stats.elapsedMs} ms</strong>
      </article>
      <article class="stat-card">
        <span>Resolution</span>
        <strong>${model.stats.resolutionLabel}</strong>
      </article>
    </div>

    <section class="panel-card warnings-card">
      <div class="panel-heading">
        <div>
          <p class="panel-kicker">Status</p>
          <h2>Warnings</h2>
        </div>
      </div>
      <ul class="warning-list">
        ${model.stats.warnings.map((warning) => `<li>${warning}</li>`).join("")}
      </ul>
    </section>
  `;

  return panel;
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

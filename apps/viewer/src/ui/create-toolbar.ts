import type { ViewerUiModel } from "@ray2/ui-model";

const COMPARISON_MODE_OPTIONS = [
  { value: "babylon-only", label: "Babylon only" },
  { value: "path-tracer-only", label: "Path tracer only" },
  { value: "blend", label: "Blend" },
  { value: "difference", label: "Difference" },
] as const;

const POST_SNAPSHOT_OPTIONS = [
  { value: "keep", label: "Keep" },
  { value: "pause", label: "Pause" },
  { value: "dispose", label: "Dispose" },
] as const;

export function createToolbar(model: ViewerUiModel): HTMLElement {
  const panel = document.createElement("aside");
  panel.className = "control-panel";

  panel.innerHTML = `
    <section class="panel-card panel-card-accent">
      <div class="panel-heading">
        <div>
          <p class="panel-kicker">Controls</p>
          <h2>Render session</h2>
        </div>
        <div class="button-row">
          <button class="primary-button" type="button">Render</button>
          <button class="ghost-button" type="button">Reset</button>
        </div>
      </div>

      <label class="field">
        <span>View mode</span>
        <select name="comparisonMode">
          ${COMPARISON_MODE_OPTIONS.map((option) => `
            <option value="${option.value}"${option.value === model.comparisonMode ? " selected" : ""}>
              ${option.label}
            </option>
          `).join("")}
        </select>
      </label>

      <label class="field">
        <span>Blend slider</span>
        <input type="range" min="0" max="100" value="${model.blendFactor}" />
        <strong>${model.blendFactor}%</strong>
      </label>

      <label class="field">
        <span>Post-snapshot mode</span>
        <select name="postSnapshotMode">
          ${POST_SNAPSHOT_OPTIONS.map((option) => `
            <option value="${option.value}"${option.value === model.postSnapshotMode ? " selected" : ""}>
              ${option.label}
            </option>
          `).join("")}
        </select>
      </label>
    </section>

    <section class="panel-card">
      <div class="panel-heading">
        <div>
          <p class="panel-kicker">Settings</p>
          <h2>Basic render controls</h2>
        </div>
      </div>

      <div class="field-grid">
        <label class="field">
          <span>Samples</span>
          <input type="number" min="1" value="${model.renderSettings.samples}" />
        </label>
        <label class="field">
          <span>Max bounces</span>
          <input type="number" min="1" value="${model.renderSettings.maxBounces}" />
        </label>
        <label class="field">
          <span>Width</span>
          <input type="number" min="1" value="${model.renderSettings.width}" />
        </label>
        <label class="field">
          <span>Height</span>
          <input type="number" min="1" value="${model.renderSettings.height}" />
        </label>
      </div>
    </section>
  `;

  return panel;
}

import type { ViewerUiModel } from "@ray2/ui-model";

const EXAMPLE_SCENE_OPTIONS = [
  { value: "simple-box", label: "Simple box" },
  { value: "pbr-spheres", label: "PBR spheres" },
  { value: "glb-barrel", label: "Imported GLB" },
] as const;

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

const TONEMAPPING_OPTIONS = [
  { value: "none", label: "None" },
  { value: "reinhard", label: "Reinhard" },
  { value: "aces", label: "ACES" },
] as const;

export interface ToolbarRefs {
  root: HTMLElement;
  exampleSceneSelect: HTMLSelectElement;
  renderButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  comparisonModeSelect: HTMLSelectElement;
  blendSlider: HTMLInputElement;
  blendValue: HTMLElement;
  postSnapshotModeSelect: HTMLSelectElement;
  samplesInput: HTMLInputElement;
  maxBouncesInput: HTMLInputElement;
  widthInput: HTMLInputElement;
  heightInput: HTMLInputElement;
  fireflyClampInput: HTMLInputElement;
  exposureInput: HTMLInputElement;
  tonemappingSelect: HTMLSelectElement;
}

export function createToolbar(model: ViewerUiModel): ToolbarRefs {
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
          <button class="primary-button" type="button" data-role="render">Render</button>
          <button class="ghost-button" type="button" data-role="reset">Reset</button>
        </div>
      </div>

      <label class="field">
        <span>Example scene</span>
        <select name="exampleScene">
          ${EXAMPLE_SCENE_OPTIONS.map((option) => `
            <option value="${option.value}"${option.value === model.exampleSceneId ? " selected" : ""}>
              ${option.label}
            </option>
          `).join("")}
        </select>
      </label>

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
        <input type="range" min="0" max="100" value="${model.blendFactor}" name="blendFactor" />
        <strong data-role="blend-value">${model.blendFactor}%</strong>
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
          <input type="number" min="1" value="${model.renderSettings.samples}" name="samples" />
        </label>
        <label class="field">
          <span>Max bounces</span>
          <input type="number" min="1" value="${model.renderSettings.maxBounces}" name="maxBounces" />
        </label>
        <label class="field">
          <span>Width</span>
          <input type="number" min="1" value="${model.renderSettings.width}" name="width" readonly />
        </label>
        <label class="field">
          <span>Height</span>
          <input type="number" min="1" value="${model.renderSettings.height}" name="height" readonly />
        </label>
        <label class="field">
          <span>Firefly clamp</span>
          <input type="number" min="0" step="0.1" value="${model.renderSettings.fireflyClamp ?? 10}" name="fireflyClamp" />
        </label>
        <label class="field">
          <span>Exposure</span>
          <input type="number" min="0.1" step="0.1" value="${model.renderSettings.exposure ?? 1}" name="exposure" />
        </label>
        <label class="field field-span-2">
          <span>Tonemapping</span>
          <select name="tonemapping">
            ${TONEMAPPING_OPTIONS.map((option) => `
              <option value="${option.value}"${option.value === model.renderSettings.tonemapping ? " selected" : ""}>
                ${option.label}
              </option>
            `).join("")}
          </select>
        </label>
      </div>
    </section>
  `;

  return {
    root: panel,
    exampleSceneSelect: requireElement(panel, 'select[name="exampleScene"]'),
    renderButton: requireElement(panel, '[data-role="render"]'),
    resetButton: requireElement(panel, '[data-role="reset"]'),
    comparisonModeSelect: requireElement(panel, 'select[name="comparisonMode"]'),
    blendSlider: requireElement(panel, 'input[name="blendFactor"]'),
    blendValue: requireElement(panel, '[data-role="blend-value"]'),
    postSnapshotModeSelect: requireElement(panel, 'select[name="postSnapshotMode"]'),
    samplesInput: requireElement(panel, 'input[name="samples"]'),
    maxBouncesInput: requireElement(panel, 'input[name="maxBounces"]'),
    widthInput: requireElement(panel, 'input[name="width"]'),
    heightInput: requireElement(panel, 'input[name="height"]'),
    fireflyClampInput: requireElement(panel, 'input[name="fireflyClamp"]'),
    exposureInput: requireElement(panel, 'input[name="exposure"]'),
    tonemappingSelect: requireElement(panel, 'select[name="tonemapping"]'),
  };
}

function requireElement<TElement extends Element>(
  root: ParentNode,
  selector: string,
): TElement {
  const element = root.querySelector<TElement>(selector);

  if (!element) {
    throw new Error(`Expected toolbar element "${selector}".`);
  }

  return element;
}

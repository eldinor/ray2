import { DEFAULT_VIEWER_UI_MODEL } from "@ray2/ui-model";

import { createToolbar } from "../ui/create-toolbar";
import { createViewportPanel } from "../ui/create-viewport-panel";

export function createAppShell(): HTMLElement {
  const shell = document.createElement("main");
  shell.className = "app-shell";

  const topbar = document.createElement("header");
  topbar.className = "topbar";
  topbar.innerHTML = `
    <div>
      <p class="eyebrow">Ray2</p>
      <h1 class="title">Unified viewport shell</h1>
    </div>
    <p class="status-pill">Task 6</p>
  `;

  const workspace = document.createElement("section");
  workspace.className = "workspace";

  const toolbar = createToolbar(DEFAULT_VIEWER_UI_MODEL);
  const viewportPanel = createViewportPanel(DEFAULT_VIEWER_UI_MODEL);

  workspace.append(toolbar, viewportPanel);
  shell.append(topbar, workspace);

  return shell;
}

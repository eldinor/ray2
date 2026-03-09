import { bootstrapViewer } from "../controllers/bootstrap-viewer";

export function createAppShell(): HTMLElement {
  return bootstrapViewer();
}

import "./styles/main.css";
import { createAppShell } from "./app/create-app-shell";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("Expected #app root element.");
}

appRoot.append(createAppShell());

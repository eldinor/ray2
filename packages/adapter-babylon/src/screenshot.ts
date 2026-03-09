import { CreateScreenshotUsingRenderTargetAsync } from "@babylonjs/core/Misc/screenshotTools";
import type { Scene } from "@babylonjs/core/scene";

export interface ScreenshotResult {
  image: Blob;
  width: number;
  height: number;
  warnings: string[];
}

export async function captureScreenshot(
  scene: Scene,
): Promise<ScreenshotResult> {
  const engine = scene.getEngine();
  const camera = scene.activeCamera;

  if (!camera) {
    throw new Error("Cannot capture screenshot without an active Babylon camera.");
  }

  const renderingCanvas = engine.getRenderingCanvas();
  const width = renderingCanvas?.width ?? engine.getRenderWidth();
  const height = renderingCanvas?.height ?? engine.getRenderHeight();

  if (width <= 0 || height <= 0) {
    throw new Error("Cannot capture screenshot for a zero-sized render canvas.");
  }

  const dataUrl = await CreateScreenshotUsingRenderTargetAsync(
    engine,
    camera,
    { width, height },
    "image/png",
  );
  const image = await dataUrlToBlob(dataUrl);

  return {
    image,
    width,
    height,
    warnings: [],
  };
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error("Babylon screenshot data URL could not be converted to a Blob.");
  }

  return response.blob();
}

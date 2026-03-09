import type { RenderCamera } from "./camera";
import type { RenderEnvironment } from "./environment";
import type { RenderGeometry, RenderInstance } from "./geometry";
import type { RenderLight } from "./lights";
import type { RenderMaterial, RenderTexture } from "./materials";

export interface RenderSceneMetadata {
  source: "babylon" | "gltf" | "unknown";
  warnings?: string[];
}

export interface RenderScene {
  geometries: RenderGeometry[];
  instances: RenderInstance[];
  materials: RenderMaterial[];
  textures: RenderTexture[];
  lights: RenderLight[];
  camera: RenderCamera | null;
  environment?: RenderEnvironment;
  metadata?: RenderSceneMetadata;
}

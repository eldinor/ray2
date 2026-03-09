import "@babylonjs/loaders/glTF";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

export type BabylonExampleSceneId = "simple-box" | "pbr-spheres" | "glb-barrel";
export type BabylonHostLifecycleState = "live" | "paused" | "disposed";

export const GLB_BARREL_URL =
  "https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/ExplodingBarrel.glb";

const EXAMPLE_SCENE_LABELS: Record<BabylonExampleSceneId, string> = {
  "simple-box": "Simple box",
  "pbr-spheres": "PBR spheres",
  "glb-barrel": "Imported GLB",
};

export interface BabylonExampleSceneHost {
  readonly canvas: HTMLCanvasElement;
  readonly engine: Engine;
  readonly sceneId: BabylonExampleSceneId;
  readonly lifecycleState: BabylonHostLifecycleState;
  getScene(): Scene;
  getSceneLabel(): string;
  getSceneDescription(): string;
  getSceneWarnings(): string[];
  ensureReady(): Promise<void>;
  loadScene(sceneId: BabylonExampleSceneId): Promise<void>;
  resize(width: number, height: number): void;
  pause(): void;
  resume(): Promise<void>;
  disposeScene(): void;
  dispose(): void;
}

export function createBabylonExampleSceneHost(options: {
  canvas: HTMLCanvasElement;
  initialSceneId: BabylonExampleSceneId;
}): BabylonExampleSceneHost {
  return new DefaultBabylonExampleSceneHost(options.canvas, options.initialSceneId).initialize();
}

class DefaultBabylonExampleSceneHost implements BabylonExampleSceneHost {
  readonly canvas: HTMLCanvasElement;
  readonly engine: Engine;

  get sceneId(): BabylonExampleSceneId {
    return this.currentSceneId;
  }

  get lifecycleState(): BabylonHostLifecycleState {
    return this.currentLifecycleState;
  }

  private activeScene: Scene | null = null;
  private currentLifecycleState: BabylonHostLifecycleState = "disposed";
  private currentSceneId: BabylonExampleSceneId;
  private disposed = false;
  private loadPromise: Promise<void> | null = null;

  constructor(canvas: HTMLCanvasElement, initialSceneId: BabylonExampleSceneId) {
    this.canvas = canvas;
    this.currentSceneId = initialSceneId;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      premultipliedAlpha: false,
    });
  }

  initialize(): BabylonExampleSceneHost {
    this.engine.runRenderLoop(() => {
      if (this.currentLifecycleState !== "live") {
        return;
      }

      this.activeScene?.render();
    });

    void this.loadScene(this.currentSceneId);

    return this;
  }

  getScene(): Scene {
    if (!this.activeScene) {
      throw new Error("Babylon scene host has no active scene.");
    }

    return this.activeScene;
  }

  getSceneLabel(): string {
    return EXAMPLE_SCENE_LABELS[this.currentSceneId];
  }

  getSceneDescription(): string {
    switch (this.currentSceneId) {
      case "simple-box":
        return "Camera, geometry, and screenshot alignment validation.";
      case "pbr-spheres":
        return "Material mapping, lighting balance, and reflections validation.";
      case "glb-barrel":
        return `GLB import validation using ${GLB_BARREL_URL}`;
    }
  }

  getSceneWarnings(): string[] {
    if (this.currentSceneId === "glb-barrel") {
      return [
        `GLB URL: ${GLB_BARREL_URL}`,
        "Loaded through Babylon SceneLoader in adapter-babylon.",
      ];
    }

    return [`Example scene hosted by Babylon: ${this.getSceneLabel()}.`];
  }

  async ensureReady(): Promise<void> {
    await this.loadPromise;
  }

  async loadScene(sceneId: BabylonExampleSceneId): Promise<void> {
    if (this.disposed) {
      throw new Error("Babylon scene host has been disposed.");
    }

    this.currentSceneId = sceneId;
    this.loadPromise = this.createScene(sceneId);
    await this.loadPromise;
  }

  resize(width: number, height: number): void {
    const nextWidth = Math.max(1, Math.round(width));
    const nextHeight = Math.max(1, Math.round(height));

    this.canvas.width = nextWidth;
    this.canvas.height = nextHeight;
    this.engine.setSize(nextWidth, nextHeight);
  }

  pause(): void {
    this.currentLifecycleState = "paused";
  }

  async resume(): Promise<void> {
    if (this.currentLifecycleState === "disposed" || !this.activeScene) {
      await this.loadScene(this.currentSceneId);
      return;
    }

    this.currentLifecycleState = "live";
  }

  disposeScene(): void {
    this.activeScene?.dispose();
    this.activeScene = null;
    this.currentLifecycleState = "disposed";
  }

  dispose(): void {
    this.disposeScene();
    this.engine.dispose();
    this.disposed = true;
  }

  private async createScene(sceneId: BabylonExampleSceneId): Promise<void> {
    this.activeScene?.dispose();

    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(0.05, 0.08, 0.13, 1);
    const camera = createCamera(scene);

    switch (sceneId) {
      case "simple-box":
        createSimpleBoxScene(scene, camera);
        break;
      case "pbr-spheres":
        createPbrSpheresScene(scene, camera);
        break;
      case "glb-barrel":
        await createGlbBarrelScene(scene, camera);
        break;
    }

    await scene.whenReadyAsync();
    scene.activeCamera?.attachControl(this.canvas, true);
    scene.render();
    this.activeScene = scene;
    this.currentLifecycleState = "live";
  }
}

function createCamera(scene: Scene): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    "main-camera",
    -Math.PI / 2,
    Math.PI / 2.6,
    8,
    Vector3.Zero(),
    scene,
  );

  camera.minZ = 0.1;
  camera.maxZ = 1000;
  camera.fov = 0.9;

  return camera;
}

function createSimpleBoxScene(scene: Scene, camera: ArcRotateCamera): void {
  camera.setTarget(new Vector3(0, 0.8, 0));
  camera.radius = 6;

  const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemi.intensity = 1.15;

  const sun = new DirectionalLight("sun", new Vector3(-0.45, -1, 0.35), scene);
  sun.intensity = 2.8;

  const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  box.position.y = 1.1;

  const boxMaterial = new PBRMaterial("box-material", scene);
  boxMaterial.albedoColor = Color3.FromHexString("#e59c4d");
  boxMaterial.metallic = 0.05;
  boxMaterial.roughness = 0.82;
  box.material = boxMaterial;

  const ground = MeshBuilder.CreateGround("ground", { width: 8, height: 8 }, scene);
  const groundMaterial = new PBRMaterial("ground-material", scene);
  groundMaterial.albedoColor = new Color3(0.16, 0.19, 0.24);
  groundMaterial.metallic = 0;
  groundMaterial.roughness = 1;
  ground.material = groundMaterial;
}

function createPbrSpheresScene(scene: Scene, camera: ArcRotateCamera): void {
  camera.setTarget(new Vector3(0, 1.2, 0));
  camera.radius = 9;

  const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.65;

  const key = new DirectionalLight("key", new Vector3(-0.55, -1, 0.25), scene);
  key.intensity = 3.2;

  const rim = new PointLight("rim", new Vector3(3, 2, -4), scene);
  rim.intensity = 35;

  const ground = MeshBuilder.CreateGround("ground", { width: 12, height: 12 }, scene);
  const groundMaterial = new PBRMaterial("ground-material", scene);
  groundMaterial.albedoColor = new Color3(0.12, 0.14, 0.18);
  groundMaterial.metallic = 0;
  groundMaterial.roughness = 1;
  ground.material = groundMaterial;

  const materials = [
    {
      name: "rough-red",
      baseColor: Color3.FromHexString("#d84f38"),
      metallic: 0.05,
      roughness: 0.9,
      x: -2.2,
    },
    {
      name: "gold",
      baseColor: Color3.FromHexString("#f0bf45"),
      metallic: 1,
      roughness: 0.2,
      x: 0,
    },
    {
      name: "coated-blue",
      baseColor: Color3.FromHexString("#5e8bff"),
      metallic: 0.15,
      roughness: 0.08,
      x: 2.2,
    },
  ];

  for (const materialOptions of materials) {
    const sphere = MeshBuilder.CreateSphere(
      `${materialOptions.name}-sphere`,
      { diameter: 1.8, segments: 48 },
      scene,
    );
    sphere.position = new Vector3(materialOptions.x, 1, 0);

    const material = new PBRMaterial(`${materialOptions.name}-material`, scene);
    material.albedoColor = materialOptions.baseColor;
    material.metallic = materialOptions.metallic;
    material.roughness = materialOptions.roughness;
    sphere.material = material;
  }
}

async function createGlbBarrelScene(
  scene: Scene,
  camera: ArcRotateCamera,
): Promise<void> {
  camera.setTarget(new Vector3(0, 0.8, 0));
  camera.radius = 5;

  const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.7;

  const key = new DirectionalLight("key", new Vector3(-0.4, -1, 0.25), scene);
  key.intensity = 3.4;

  const rootUrl = GLB_BARREL_URL.slice(0, GLB_BARREL_URL.lastIndexOf("/") + 1);
  const fileName = GLB_BARREL_URL.slice(GLB_BARREL_URL.lastIndexOf("/") + 1);
  await SceneLoader.ImportMeshAsync("", rootUrl, fileName, scene);

  frameImportedContent(scene, camera);

  const ground = MeshBuilder.CreateGround("ground", { width: 8, height: 8 }, scene);
  ground.position.y = -0.01;
  const groundMaterial = new PBRMaterial("ground-material", scene);
  groundMaterial.albedoColor = new Color3(0.13, 0.15, 0.18);
  groundMaterial.metallic = 0;
  groundMaterial.roughness = 1;
  ground.material = groundMaterial;
}

function frameImportedContent(scene: Scene, camera: ArcRotateCamera): void {
  const meshes = scene.meshes.filter((mesh) => mesh.name !== "ground");

  if (meshes.length === 0) {
    return;
  }

  let min = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
  let max = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

  for (const mesh of meshes) {
    const bounds = mesh.getHierarchyBoundingVectors(true);
    min = Vector3.Minimize(min, bounds.min);
    max = Vector3.Maximize(max, bounds.max);
  }

  const center = min.add(max).scale(0.5);
  const extent = max.subtract(min);
  const radius = Math.max(extent.length() * 0.75, 1.5);

  camera.setTarget(center);
  camera.radius = radius;
}

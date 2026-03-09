# Core API Contracts Instructions

## Rule
These contracts are neutral and must not depend on Babylon types.

## Scene Types

```ts
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

export interface RenderSceneMetadata {
  source: "babylon" | "gltf" | "unknown";
  warnings?: string[];
}
```

## Geometry and Instances

```ts
export interface RenderGeometry {
  id: string;
  positions: Float32Array;
  indices: Uint32Array | Uint16Array;
  normals?: Float32Array;
  tangents?: Float32Array;
  uvs0?: Float32Array;
  uvs1?: Float32Array;
  bounds?: RenderBounds;
  primitiveRanges?: RenderPrimitiveRange[];
}

export interface RenderPrimitiveRange {
  materialIndex: number;
  indexStart: number;
  indexCount: number;
}

export interface RenderInstance {
  id: string;
  geometryId: string;
  worldMatrix: Float32Array;
  visible: boolean;
  materialOverrides?: number[];
}
```

## Materials and Textures

```ts
export type AlphaMode = "opaque" | "mask" | "blend";

export interface RenderMaterial {
  id: string;
  name?: string;
  baseColorFactor: [number, number, number, number];
  metallicFactor: number;
  roughnessFactor: number;
  emissiveFactor?: [number, number, number];
  normalTextureIndex?: number;
  baseColorTextureIndex?: number;
  metallicRoughnessTextureIndex?: number;
  emissiveTextureIndex?: number;
  alphaMode: AlphaMode;
  alphaCutoff?: number;
  doubleSided?: boolean;
}

export interface RenderTexture {
  id: string;
  name?: string;
  uri?: string;
  width?: number;
  height?: number;
  colorSpace?: "srgb" | "linear";
}
```

## Lights / Camera / Environment

```ts
export type RenderLight =
  | RenderDirectionalLight
  | RenderPointLight
  | RenderSpotLight;

export interface RenderDirectionalLight {
  type: "directional";
  id: string;
  color: [number, number, number];
  intensity: number;
  direction: [number, number, number];
}

export interface RenderPointLight {
  type: "point";
  id: string;
  color: [number, number, number];
  intensity: number;
  position: [number, number, number];
  range?: number;
}

export interface RenderSpotLight {
  type: "spot";
  id: string;
  color: [number, number, number];
  intensity: number;
  position: [number, number, number];
  direction: [number, number, number];
  innerConeAngle: number;
  outerConeAngle: number;
  range?: number;
}

export interface RenderCamera {
  id: string;
  worldMatrix: Float32Array;
  projectionType: "perspective";
  verticalFovRadians: number;
  aspectRatio: number;
  near: number;
  far: number;
}

export interface RenderEnvironment {
  textureIndex?: number;
  intensity: number;
  rotationRadians: number;
}
```

## Snapshot and Settings

```ts
export interface SnapshotResult {
  scene: RenderScene;
  referenceImage: ImageBitmap | Blob | Uint8Array;
  width: number;
  height: number;
  warnings: string[];
}

export interface RenderSettings {
  width: number;
  height: number;
  samples: number;
  maxBounces: number;
  fireflyClamp?: number;
  denoiserEnabled?: boolean;
  environmentIntensity?: number;
}
```

## Worker Protocol

```ts
export type RenderWorkerRequest =
  | { type: "initialize"; canvas?: OffscreenCanvas }
  | { type: "loadScene"; scene: RenderScene; settings: RenderSettings; referenceWidth: number; referenceHeight: number }
  | { type: "startRender"; settings: RenderSettings }
  | { type: "reset" }
  | { type: "dispose" };

export type RenderWorkerEvent =
  | { type: "initialized" }
  | { type: "progress"; sampleCount: number; elapsedMs: number }
  | { type: "frame"; bitmap?: ImageBitmap }
  | { type: "error"; message: string };
```

## Adapter Contract

```ts
export interface SceneAdapter<TScene> {
  extractSnapshot(scene: TScene): Promise<SnapshotResult> | SnapshotResult;
}
```

## Controller Contract

```ts
export type PostSnapshotMode = "keep" | "pause" | "dispose";

export interface RendererController {
  render(): Promise<void>;
  reset(): void;
  setRenderSettings(settings: Partial<RenderSettings>): void;
  setPostSnapshotMode(mode: PostSnapshotMode): void;
}
```

import type { RenderScene, SnapshotResult } from "@ray2/render-scene";

export type ExampleSceneId = "simple-box" | "pbr-spheres" | "glb-barrel";

export interface ExampleScenePreset {
  id: ExampleSceneId;
  label: string;
  sourceLabel: string;
  description: string;
  scene: RenderScene;
  createReferenceImage(width: number, height: number): Blob;
  createWarnings(width: number, height: number): string[];
}

export const GLB_BARREL_URL =
  "https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/ExplodingBarrel.glb";

export const EXAMPLE_SCENE_PRESETS: Record<ExampleSceneId, ExampleScenePreset> = {
  "simple-box": {
    id: "simple-box",
    label: "Simple box",
    sourceLabel: "Procedural validation scene",
    description: "Validates camera extraction, basic geometry, and screenshot alignment.",
    scene: {
      geometries: [
        {
          id: "box-geometry",
          positions: Float32Array.from([
            -1, -1, 1,
            1, -1, 1,
            1, 1, 1,
            -1, 1, 1,
            -1, -1, -1,
            1, -1, -1,
            1, 1, -1,
            -1, 1, -1,
          ]),
          indices: Uint16Array.from([
            0, 1, 2, 0, 2, 3,
            1, 5, 6, 1, 6, 2,
            5, 4, 7, 5, 7, 6,
            4, 0, 3, 4, 3, 7,
            3, 2, 6, 3, 6, 7,
            4, 5, 1, 4, 1, 0,
          ]),
          bounds: {
            min: [-1, -1, -1],
            max: [1, 1, 1],
          },
          primitiveRanges: [
            {
              materialIndex: 0,
              indexStart: 0,
              indexCount: 36,
            },
          ],
        },
      ],
      instances: [
        {
          id: "box-instance",
          geometryId: "box-geometry",
          worldMatrix: identityMatrix(),
          visible: true,
        },
      ],
      materials: [
        {
          id: "box-material",
          name: "Debug box",
          baseColorFactor: [0.88, 0.58, 0.24, 1],
          metallicFactor: 0.05,
          roughnessFactor: 0.82,
          alphaMode: "opaque",
        },
      ],
      textures: [],
      lights: [
        {
          type: "directional",
          id: "sun",
          color: [1, 0.97, 0.92],
          intensity: 2.8,
          direction: [-0.4, -1, 0.3],
        },
      ],
      camera: createCamera(1),
      metadata: {
        source: "unknown",
        warnings: [
          "Simple box scene is a viewer-side validation preset.",
        ],
      },
    },
    createReferenceImage(width, height) {
      return createSvgReferenceImage({
        width,
        height,
        title: "Simple Box",
        subtitle: "Camera, geometry, and alignment validation",
        accents: ["#2d6cdf", "#f5a65b"],
        shapes: [
          `<rect x="${width * 0.24}" y="${height * 0.24}" width="${width * 0.32}" height="${height * 0.32}" rx="24" fill="rgba(255,255,255,0.16)" />`,
          `<rect x="${width * 0.31}" y="${height * 0.18}" width="${width * 0.26}" height="${height * 0.26}" rx="22" fill="rgba(255,213,138,0.24)" />`,
        ],
      });
    },
    createWarnings(width, height) {
      return [
        "Example scene: simple box.",
        `Reference dimensions follow the viewport canvas: ${width} x ${height}.`,
      ];
    },
  },
  "pbr-spheres": {
    id: "pbr-spheres",
    label: "PBR spheres",
    sourceLabel: "Material validation scene",
    description: "Validates material mapping, reflections, and lighting balance.",
    scene: {
      geometries: [
        {
          id: "sphere-geometry",
          positions: Float32Array.from([
            0, 1, 0,
            -0.87, -0.5, 0,
            0.87, -0.5, 0,
            0, -0.5, 0.87,
            0, -0.5, -0.87,
          ]),
          indices: Uint16Array.from([
            0, 1, 3,
            0, 3, 2,
            0, 2, 4,
            0, 4, 1,
            1, 4, 3,
            4, 2, 3,
          ]),
          bounds: {
            min: [-0.87, -0.5, -0.87],
            max: [0.87, 1, 0.87],
          },
          primitiveRanges: [
            {
              materialIndex: 0,
              indexStart: 0,
              indexCount: 6,
            },
            {
              materialIndex: 1,
              indexStart: 6,
              indexCount: 6,
            },
            {
              materialIndex: 2,
              indexStart: 12,
              indexCount: 6,
            },
          ],
        },
      ],
      instances: [
        createTranslatedInstance("sphere-left", "sphere-geometry", -2.1, 0, 0),
        createTranslatedInstance("sphere-center", "sphere-geometry", 0, 0, 0),
        createTranslatedInstance("sphere-right", "sphere-geometry", 2.1, 0, 0),
      ],
      materials: [
        {
          id: "sphere-rough-red",
          name: "Rough red",
          baseColorFactor: [0.85, 0.28, 0.22, 1],
          metallicFactor: 0.05,
          roughnessFactor: 0.9,
          alphaMode: "opaque",
        },
        {
          id: "sphere-gold",
          name: "Gold",
          baseColorFactor: [1, 0.78, 0.28, 1],
          metallicFactor: 1,
          roughnessFactor: 0.2,
          alphaMode: "opaque",
        },
        {
          id: "sphere-blue-coated",
          name: "Blue coated",
          baseColorFactor: [0.34, 0.56, 0.92, 1],
          metallicFactor: 0.15,
          roughnessFactor: 0.08,
          alphaMode: "opaque",
        },
      ],
      textures: [],
      lights: [
        {
          type: "directional",
          id: "key",
          color: [1, 0.98, 0.95],
          intensity: 3.4,
          direction: [-0.55, -1, 0.2],
        },
        {
          type: "point",
          id: "rim",
          color: [0.36, 0.5, 1],
          intensity: 18,
          position: [3, 2, -4],
          range: 12,
        },
      ],
      camera: createCamera(1),
      environment: {
        intensity: 1.4,
        rotationRadians: 0.2,
      },
      metadata: {
        source: "unknown",
        warnings: [
          "PBR spheres scene is a viewer-side validation preset.",
        ],
      },
    },
    createReferenceImage(width, height) {
      return createSvgReferenceImage({
        width,
        height,
        title: "PBR Spheres",
        subtitle: "Material mapping, lighting, and reflections",
        accents: ["#17355f", "#e8af3e"],
        shapes: [
          createCircle(width * 0.26, height * 0.54, Math.max(48, width * 0.08), "rgba(242,103,82,0.82)"),
          createCircle(width * 0.5, height * 0.46, Math.max(54, width * 0.095), "rgba(255,214,102,0.9)"),
          createCircle(width * 0.74, height * 0.58, Math.max(50, width * 0.085), "rgba(96,145,255,0.88)"),
        ],
      });
    },
    createWarnings(width, height) {
      return [
        "Example scene: PBR spheres.",
        `Reference dimensions follow the viewport canvas: ${width} x ${height}.`,
      ];
    },
  },
  "glb-barrel": {
    id: "glb-barrel",
    label: "Imported GLB",
    sourceLabel: "GLB import validation scene",
    description: "Validates GLB import, Babylon-native extraction, and submesh/material handling.",
    scene: {
      geometries: [],
      instances: [],
      materials: [],
      textures: [
        {
          id: "glb-source",
          name: "ExplodingBarrel.glb",
          uri: GLB_BARREL_URL,
          colorSpace: "srgb",
        },
      ],
      lights: [
        {
          type: "directional",
          id: "key",
          color: [1, 0.98, 0.95],
          intensity: 3.2,
          direction: [-0.4, -1, 0.25],
        },
      ],
      camera: createCamera(1),
      metadata: {
        source: "gltf",
        warnings: [
          `GLB source configured: ${GLB_BARREL_URL}`,
          "Viewer-side GLB preset represents the imported asset before Babylon viewport integration.",
        ],
      },
    },
    createReferenceImage(width, height) {
      return createSvgReferenceImage({
        width,
        height,
        title: "Imported GLB",
        subtitle: "ExplodingBarrel.glb import path",
        accents: ["#18212d", "#f18f4d"],
        shapes: [
          `<rect x="${width * 0.34}" y="${height * 0.24}" width="${width * 0.18}" height="${height * 0.4}" rx="24" fill="rgba(241,143,77,0.8)" />`,
          `<rect x="${width * 0.31}" y="${height * 0.2}" width="${width * 0.24}" height="${height * 0.1}" rx="18" fill="rgba(255,255,255,0.2)" />`,
          `<path d="M ${width * 0.28} ${height * 0.68} C ${width * 0.42} ${height * 0.5}, ${width * 0.56} ${height * 0.82}, ${width * 0.72} ${height * 0.62}" stroke="rgba(255,213,138,0.6)" stroke-width="${Math.max(8, width * 0.01)}" fill="none" stroke-linecap="round" />`,
        ],
      });
    },
    createWarnings(width, height) {
      return [
        "Example scene: imported GLB.",
        `GLB URL: ${GLB_BARREL_URL}`,
        `Reference dimensions follow the viewport canvas: ${width} x ${height}.`,
      ];
    },
  },
};

export function createExampleSnapshot(
  sceneId: ExampleSceneId,
  width: number,
  height: number,
): SnapshotResult {
  const preset = EXAMPLE_SCENE_PRESETS[sceneId];
  const scene = cloneScene(preset.scene, width, height);

  return {
    scene,
    referenceImage: preset.createReferenceImage(width, height),
    width,
    height,
    warnings: [
      preset.description,
      ...preset.createWarnings(width, height),
      ...(scene.metadata?.warnings ?? []),
    ],
  };
}

function cloneScene(
  scene: RenderScene,
  width: number,
  height: number,
): RenderScene {
  return {
    ...scene,
    geometries: scene.geometries.map((geometry) => ({
      ...geometry,
      positions: new Float32Array(geometry.positions),
      indices:
        geometry.indices instanceof Uint32Array
          ? new Uint32Array(geometry.indices)
          : new Uint16Array(geometry.indices),
      normals: geometry.normals ? new Float32Array(geometry.normals) : undefined,
      tangents: geometry.tangents ? new Float32Array(geometry.tangents) : undefined,
      uvs0: geometry.uvs0 ? new Float32Array(geometry.uvs0) : undefined,
      uvs1: geometry.uvs1 ? new Float32Array(geometry.uvs1) : undefined,
      bounds: geometry.bounds
        ? {
            min: [...geometry.bounds.min] as [number, number, number],
            max: [...geometry.bounds.max] as [number, number, number],
          }
        : undefined,
      primitiveRanges: geometry.primitiveRanges?.map((range) => ({ ...range })),
    })),
    instances: scene.instances.map((instance) => ({
      ...instance,
      worldMatrix: new Float32Array(instance.worldMatrix),
      materialOverrides: instance.materialOverrides
        ? [...instance.materialOverrides]
        : undefined,
    })),
    materials: scene.materials.map((material) => ({ ...material })),
    textures: scene.textures.map((texture) => ({ ...texture })),
    lights: scene.lights.map((light) => ({ ...light })),
    camera: scene.camera
      ? {
          ...scene.camera,
          aspectRatio: width / height,
          worldMatrix: new Float32Array(scene.camera.worldMatrix),
        }
      : null,
    environment: scene.environment ? { ...scene.environment } : undefined,
    metadata: scene.metadata
      ? {
          ...scene.metadata,
          warnings: scene.metadata.warnings ? [...scene.metadata.warnings] : undefined,
        }
      : undefined,
  };
}

function createCamera(aspectRatio: number) {
  return {
    id: "example-camera",
    worldMatrix: Float32Array.from([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 6, 1,
    ]),
    projectionType: "perspective" as const,
    verticalFovRadians: 0.9,
    aspectRatio,
    near: 0.1,
    far: 1000,
  };
}

function identityMatrix(): Float32Array {
  return Float32Array.from([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function createTranslatedInstance(
  id: string,
  geometryId: string,
  x: number,
  y: number,
  z: number,
) {
  return {
    id,
    geometryId,
    visible: true,
    worldMatrix: Float32Array.from([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1,
    ]),
  };
}

function createSvgReferenceImage(options: {
  width: number;
  height: number;
  title: string;
  subtitle: string;
  accents: [string, string];
  shapes: string[];
}): Blob {
  const { width, height, title, subtitle, accents, shapes } = options;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accents[0]}" />
          <stop offset="100%" stop-color="${accents[1]}" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect x="${width * 0.06}" y="${height * 0.08}" width="${width * 0.88}" height="${height * 0.84}" rx="28" fill="rgba(9,15,25,0.16)" />
      ${shapes.join("\n")}
      <text x="${width * 0.08}" y="${height * 0.82}" fill="#f4f8ff" font-size="${Math.max(22, width * 0.032)}" font-family="Segoe UI, sans-serif">
        ${escapeXml(title)}
      </text>
      <text x="${width * 0.08}" y="${height * 0.9}" fill="rgba(244,248,255,0.78)" font-size="${Math.max(14, width * 0.018)}" font-family="Segoe UI, sans-serif">
        ${escapeXml(subtitle)}
      </text>
    </svg>
  `.trim();

  return new Blob([svg], { type: "image/svg+xml" });
}

function createCircle(
  cx: number,
  cy: number,
  r: number,
  fill: string,
): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

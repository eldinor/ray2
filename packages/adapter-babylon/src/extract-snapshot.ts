import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { MultiMaterial } from "@babylonjs/core/Materials/multiMaterial";
import type { Material } from "@babylonjs/core/Materials/material";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type {
  RenderCamera,
  RenderGeometry,
  RenderInstance,
  RenderMaterial,
  RenderPrimitiveRange,
  RenderScene,
  RenderTexture,
  SceneAdapter,
  SnapshotResult,
} from "@ray2/render-scene";

import { mapMaterial } from "./material-mapper";
import { captureScreenshot } from "./screenshot";

function createEmptyRenderScene(): RenderScene {
  return {
    geometries: [],
    instances: [],
    materials: [],
    textures: [],
    lights: [],
    camera: null,
    metadata: {
      source: "babylon",
      warnings: [],
    },
  };
}

export async function extractSnapshot(scene: Scene): Promise<SnapshotResult> {
  const screenshot = await captureScreenshot(scene);
  const warnings = [...screenshot.warnings];
  const textures: RenderTexture[] = [];
  const textureIndexById = new Map<string, number>();
  const materials: RenderMaterial[] = [];
  const materialIndexById = new Map<string, number>();
  const geometries: RenderGeometry[] = [];
  const geometryIds = new Set<string>();
  const instances: RenderInstance[] = [];
  const textureRegistry = {
    add(texture: RenderTexture): number {
      const existingIndex = textureIndexById.get(texture.id);

      if (existingIndex !== undefined) {
        return existingIndex;
      }

      const nextIndex = textures.length;
      textures.push(texture);
      textureIndexById.set(texture.id, nextIndex);

      return nextIndex;
    },
  };

  const defaultMaterialIndex = ensureMaterialIndex(
    null,
    materials,
    materialIndexById,
    textureRegistry,
    warnings,
  );

  const camera = extractCamera(scene, screenshot.width, screenshot.height, warnings);

  for (const abstractMesh of scene.meshes) {
    if (!(abstractMesh instanceof Mesh)) {
      warnings.push(`Skipping non-Mesh node "${abstractMesh.name}".`);
      continue;
    }

    if (!abstractMesh.isEnabled() || abstractMesh.visibility <= 0) {
      continue;
    }

    if (abstractMesh.skeleton) {
      warnings.push(`Skipping skinned mesh "${abstractMesh.name}".`);
      continue;
    }

    if (abstractMesh.morphTargetManager) {
      warnings.push(`Skipping morph-target mesh "${abstractMesh.name}".`);
      continue;
    }

    if (abstractMesh.instances.length > 0 || abstractMesh.hasThinInstances) {
      warnings.push(`Skipping instanced mesh "${abstractMesh.name}".`);
      continue;
    }

    const positions = abstractMesh.getVerticesData(VertexBuffer.PositionKind);
    const indices = abstractMesh.getIndices();

    if (!positions || !indices || positions.length === 0 || indices.length === 0) {
      warnings.push(`Skipping mesh "${abstractMesh.name}" because geometry data is incomplete.`);
      continue;
    }

    const materialBinding = resolveMeshMaterials(
      abstractMesh.material,
      materials,
      materialIndexById,
      textureRegistry,
      warnings,
      defaultMaterialIndex,
    );

    if (!materialBinding.isOpaque) {
      warnings.push(`Skipping non-opaque mesh "${abstractMesh.name}".`);
      continue;
    }

    const geometryId = abstractMesh.geometry?.id ?? abstractMesh.id;
    const primitiveRanges = createPrimitiveRanges(
      abstractMesh,
      materialBinding.materialIndices,
    );
    if (!geometryIds.has(geometryId)) {
      const geometry = createGeometry(abstractMesh, geometryId, primitiveRanges);
      geometries.push(geometry);
      geometryIds.add(geometryId);
    }

    instances.push({
      id: abstractMesh.id,
      geometryId,
      worldMatrix: toFloat32Array(abstractMesh.computeWorldMatrix(true).asArray()),
      visible: true,
    });
  }

  return {
    scene: {
      ...createEmptyRenderScene(),
      geometries,
      instances,
      materials,
      textures,
      camera,
      metadata: {
        source: "babylon",
        warnings,
      },
    },
    referenceImage: screenshot.image,
    width: screenshot.width,
    height: screenshot.height,
    warnings,
  };
}

export class BabylonSceneAdapter implements SceneAdapter<Scene> {
  extractSnapshot(scene: Scene): Promise<SnapshotResult> {
    return extractSnapshot(scene);
  }
}

function extractCamera(
  scene: Scene,
  width: number,
  height: number,
  warnings: string[],
): RenderCamera | null {
  const camera = scene.activeCamera;

  if (!camera) {
    warnings.push("Scene has no active camera.");
    return null;
  }

  if (camera.mode !== Camera.PERSPECTIVE_CAMERA) {
    warnings.push(`Camera "${camera.name}" is not perspective. Skipping camera extraction.`);
    return null;
  }

  return {
    id: camera.id,
    worldMatrix: toFloat32Array(camera.getWorldMatrix().asArray()),
    projectionType: "perspective",
    verticalFovRadians: camera.fov,
    aspectRatio: width / height,
    near: camera.minZ,
    far: camera.maxZ,
  };
}

function resolveMeshMaterials(
  material: Material | null,
  materials: RenderMaterial[],
  materialIndexById: Map<string, number>,
  textureRegistry: { add(texture: RenderTexture): number },
  warnings: string[],
  defaultMaterialIndex: number,
): { isOpaque: boolean; materialIndices: number[] } {
  if (!material) {
    return {
      isOpaque: true,
      materialIndices: [defaultMaterialIndex],
    };
  }

  if (material instanceof MultiMaterial) {
    const materialIndices = material.subMaterials.map((subMaterial) =>
      ensureMaterialIndex(
        subMaterial,
        materials,
        materialIndexById,
        textureRegistry,
        warnings,
      ),
    );

    const isOpaque = material.subMaterials.every(
      (subMaterial) => !subMaterial || mapMaterial(subMaterial, { textureRegistry }).material.alphaMode === "opaque",
    );

    return {
      isOpaque,
      materialIndices,
    };
  }

  const materialIndex = ensureMaterialIndex(
    material,
    materials,
    materialIndexById,
    textureRegistry,
    warnings,
  );
  const isOpaque = mapMaterial(material, { textureRegistry }).material.alphaMode === "opaque";

  return {
    isOpaque,
    materialIndices: [materialIndex],
  };
}

function ensureMaterialIndex(
  material: Material | null,
  materials: RenderMaterial[],
  materialIndexById: Map<string, number>,
  textureRegistry: { add(texture: RenderTexture): number },
  warnings: string[],
): number {
  const key = material?.id ?? "default-material";
  const existingIndex = materialIndexById.get(key);

  if (existingIndex !== undefined) {
    return existingIndex;
  }

  const result = mapMaterial(material, { textureRegistry });
  warnings.push(...result.warnings);

  const nextIndex = materials.length;
  materials.push(result.material);
  materialIndexById.set(key, nextIndex);

  return nextIndex;
}

function createPrimitiveRanges(
  mesh: Mesh,
  materialIndices: number[],
): RenderPrimitiveRange[] | undefined {
  if (mesh.subMeshes.length === 0) {
    return undefined;
  }

  return mesh.subMeshes.map((subMesh, index) => ({
    materialIndex: materialIndices[Math.min(index, materialIndices.length - 1)] ?? materialIndices[0] ?? 0,
    indexStart: subMesh.indexStart,
    indexCount: subMesh.indexCount,
  }));
}

function createGeometry(
  mesh: Mesh,
  geometryId: string,
  primitiveRanges: RenderPrimitiveRange[] | undefined,
): RenderGeometry {
  const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
  const indices = mesh.getIndices();

  if (!positions || !indices) {
    throw new Error(`Mesh "${mesh.name}" is missing positions or indices.`);
  }

  const normals = mesh.isVerticesDataPresent(VertexBuffer.NormalKind)
    ? mesh.getVerticesData(VertexBuffer.NormalKind)
    : null;
  const tangents = mesh.isVerticesDataPresent(VertexBuffer.TangentKind)
    ? mesh.getVerticesData(VertexBuffer.TangentKind)
    : null;
  const uvs0 = mesh.isVerticesDataPresent(VertexBuffer.UVKind)
    ? mesh.getVerticesData(VertexBuffer.UVKind)
    : null;
  const uvs1 = mesh.isVerticesDataPresent(VertexBuffer.UV2Kind)
    ? mesh.getVerticesData(VertexBuffer.UV2Kind)
    : null;
  const boundingInfo = mesh.getBoundingInfo();

  return {
    id: geometryId,
    positions: toFloat32Array(positions),
    indices: toIndexArray(indices),
    normals: normals ? toFloat32Array(normals) : undefined,
    tangents: tangents ? toFloat32Array(tangents) : undefined,
    uvs0: uvs0 ? toFloat32Array(uvs0) : undefined,
    uvs1: uvs1 ? toFloat32Array(uvs1) : undefined,
    bounds: {
      min: [
        boundingInfo.boundingBox.minimum.x,
        boundingInfo.boundingBox.minimum.y,
        boundingInfo.boundingBox.minimum.z,
      ],
      max: [
        boundingInfo.boundingBox.maximum.x,
        boundingInfo.boundingBox.maximum.y,
        boundingInfo.boundingBox.maximum.z,
      ],
    },
    primitiveRanges,
  };
}

function toFloat32Array(values: ArrayLike<number>): Float32Array {
  return Float32Array.from(values);
}

function toIndexArray(values: ArrayLike<number>): Uint16Array | Uint32Array {
  const maxIndex = getMaxValue(values);

  return maxIndex > 65535
    ? Uint32Array.from(values)
    : Uint16Array.from(values);
}

function getMaxValue(values: ArrayLike<number>): number {
  let maxValue = 0;

  for (let index = 0; index < values.length; index += 1) {
    maxValue = Math.max(maxValue, values[index] ?? 0);
  }

  return maxValue;
}

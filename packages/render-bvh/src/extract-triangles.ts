import type { RenderGeometry, RenderInstance, RenderScene } from "@ray2/render-scene";

import {
  centroidFromBounds,
  createEmptyBounds,
  includePoint,
  transformPoint,
} from "./math";
import type { BvhTriangle } from "./types";

export function extractSceneTriangles(scene: RenderScene): BvhTriangle[] {
  const geometryById = new Map<string, RenderGeometry>(
    scene.geometries.map((geometry) => [geometry.id, geometry]),
  );
  const triangles: BvhTriangle[] = [];

  for (const instance of scene.instances) {
    if (!instance.visible) {
      continue;
    }

    const geometry = geometryById.get(instance.geometryId);

    if (!geometry) {
      continue;
    }

    appendGeometryTriangles(geometry, instance, triangles);
  }

  return triangles;
}

function appendGeometryTriangles(
  geometry: RenderGeometry,
  instance: RenderInstance,
  target: BvhTriangle[],
): void {
  const primitiveRanges = geometry.primitiveRanges ?? [
    {
      materialIndex: instance.materialOverrides?.[0] ?? 0,
      indexStart: 0,
      indexCount: geometry.indices.length,
    },
  ];

  for (const primitiveRange of primitiveRanges) {
    const materialIndex =
      instance.materialOverrides?.[primitiveRange.materialIndex] ??
      primitiveRange.materialIndex;

    for (
      let indexOffset = primitiveRange.indexStart;
      indexOffset < primitiveRange.indexStart + primitiveRange.indexCount;
      indexOffset += 3
    ) {
      const index0 = geometry.indices[indexOffset];
      const index1 = geometry.indices[indexOffset + 1];
      const index2 = geometry.indices[indexOffset + 2];

      if (
        index0 === undefined ||
        index1 === undefined ||
        index2 === undefined
      ) {
        continue;
      }

      const vertex0 = transformPosition(geometry.positions, index0, instance.worldMatrix);
      const vertex1 = transformPosition(geometry.positions, index1, instance.worldMatrix);
      const vertex2 = transformPosition(geometry.positions, index2, instance.worldMatrix);
      const bounds = createEmptyBounds();
      includePoint(bounds, vertex0);
      includePoint(bounds, vertex1);
      includePoint(bounds, vertex2);

      target.push({
        triangleIndex: target.length,
        geometryId: geometry.id,
        instanceId: instance.id,
        materialIndex,
        indices: [index0, index1, index2],
        vertices: [vertex0, vertex1, vertex2],
        centroid: centroidFromBounds(bounds),
        bounds,
      });
    }
  }
}

function transformPosition(
  positions: Float32Array,
  vertexIndex: number,
  worldMatrix: Float32Array,
): [number, number, number] {
  const baseOffset = vertexIndex * 3;
  const point: [number, number, number] = [
    positions[baseOffset] ?? 0,
    positions[baseOffset + 1] ?? 0,
    positions[baseOffset + 2] ?? 0,
  ];

  return transformPoint(worldMatrix, point);
}

import type { RenderScene } from "@ray2/render-scene";

import {
  createEmptyBounds,
  includeBounds,
  longestAxis,
} from "./math";
import { extractSceneTriangles } from "./extract-triangles";
import type { BvhBounds, BvhNode, BvhTriangle, SceneBvh } from "./types";

const DEFAULT_MAX_TRIANGLES_PER_LEAF = 4;

export interface BuildBvhOptions {
  maxTrianglesPerLeaf?: number;
}

export function buildSceneBvh(
  scene: RenderScene,
  options: BuildBvhOptions = {},
): SceneBvh {
  const triangles = extractSceneTriangles(scene);

  if (triangles.length === 0) {
    return {
      root: null,
      triangles,
    };
  }

  const maxTrianglesPerLeaf =
    options.maxTrianglesPerLeaf ?? DEFAULT_MAX_TRIANGLES_PER_LEAF;

  return {
    root: buildNode(triangles, 0, triangles.length, maxTrianglesPerLeaf),
    triangles,
  };
}

function buildNode(
  triangles: BvhTriangle[],
  start: number,
  end: number,
  maxTrianglesPerLeaf: number,
): BvhNode {
  const bounds = computeBounds(triangles, start, end);
  const triangleCount = end - start;

  if (triangleCount <= maxTrianglesPerLeaf) {
    return {
      type: "leaf",
      bounds,
      triangleOffset: start,
      triangleCount,
    };
  }

  const centroidBounds = computeCentroidBounds(triangles, start, end);
  const splitAxis = longestAxis(centroidBounds);
  const sortedRange = triangles.slice(start, end).sort((left, right) => {
    return left.centroid[splitAxis] - right.centroid[splitAxis];
  });

  triangles.splice(start, triangleCount, ...sortedRange);

  const midpoint = start + Math.floor(triangleCount / 2);

  return {
    type: "inner",
    bounds,
    splitAxis,
    left: buildNode(triangles, start, midpoint, maxTrianglesPerLeaf),
    right: buildNode(triangles, midpoint, end, maxTrianglesPerLeaf),
  };
}

function computeBounds(
  triangles: BvhTriangle[],
  start: number,
  end: number,
): BvhBounds {
  const bounds = createEmptyBounds();

  for (let index = start; index < end; index += 1) {
    includeBounds(bounds, triangles[index].bounds);
  }

  return bounds;
}

function computeCentroidBounds(
  triangles: BvhTriangle[],
  start: number,
  end: number,
): BvhBounds {
  const bounds = createEmptyBounds();

  for (let index = start; index < end; index += 1) {
    includePointFromTriangle(bounds, triangles[index]);
  }

  return bounds;
}

function includePointFromTriangle(bounds: BvhBounds, triangle: BvhTriangle): void {
  bounds.min[0] = Math.min(bounds.min[0], triangle.centroid[0]);
  bounds.min[1] = Math.min(bounds.min[1], triangle.centroid[1]);
  bounds.min[2] = Math.min(bounds.min[2], triangle.centroid[2]);
  bounds.max[0] = Math.max(bounds.max[0], triangle.centroid[0]);
  bounds.max[1] = Math.max(bounds.max[1], triangle.centroid[1]);
  bounds.max[2] = Math.max(bounds.max[2], triangle.centroid[2]);
}

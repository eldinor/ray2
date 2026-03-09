import type { BvhBounds } from "./types";

export function createEmptyBounds(): BvhBounds {
  return {
    min: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    max: [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  };
}

export function includePoint(bounds: BvhBounds, point: [number, number, number]): void {
  bounds.min[0] = Math.min(bounds.min[0], point[0]);
  bounds.min[1] = Math.min(bounds.min[1], point[1]);
  bounds.min[2] = Math.min(bounds.min[2], point[2]);
  bounds.max[0] = Math.max(bounds.max[0], point[0]);
  bounds.max[1] = Math.max(bounds.max[1], point[1]);
  bounds.max[2] = Math.max(bounds.max[2], point[2]);
}

export function includeBounds(target: BvhBounds, source: BvhBounds): void {
  includePoint(target, source.min);
  includePoint(target, source.max);
}

export function centroidFromBounds(bounds: BvhBounds): [number, number, number] {
  return [
    (bounds.min[0] + bounds.max[0]) * 0.5,
    (bounds.min[1] + bounds.max[1]) * 0.5,
    (bounds.min[2] + bounds.max[2]) * 0.5,
  ];
}

export function longestAxis(bounds: BvhBounds): 0 | 1 | 2 {
  const extents: [number, number, number] = [
    bounds.max[0] - bounds.min[0],
    bounds.max[1] - bounds.min[1],
    bounds.max[2] - bounds.min[2],
  ];

  if (extents[0] >= extents[1] && extents[0] >= extents[2]) {
    return 0;
  }

  if (extents[1] >= extents[2]) {
    return 1;
  }

  return 2;
}

export function transformPoint(
  matrix: Float32Array,
  point: [number, number, number],
): [number, number, number] {
  const x = point[0];
  const y = point[1];
  const z = point[2];

  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
  ];
}

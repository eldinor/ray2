export interface BvhBounds {
  min: [number, number, number];
  max: [number, number, number];
}

export interface BvhTriangle {
  triangleIndex: number;
  geometryId: string;
  instanceId: string;
  materialIndex: number;
  indices: [number, number, number];
  vertices: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  centroid: [number, number, number];
  bounds: BvhBounds;
}

export interface BvhLeafNode {
  type: "leaf";
  bounds: BvhBounds;
  triangleOffset: number;
  triangleCount: number;
}

export interface BvhInnerNode {
  type: "inner";
  bounds: BvhBounds;
  splitAxis: 0 | 1 | 2;
  left: BvhNode;
  right: BvhNode;
}

export type BvhNode = BvhLeafNode | BvhInnerNode;

export interface SceneBvh {
  root: BvhNode | null;
  triangles: BvhTriangle[];
}

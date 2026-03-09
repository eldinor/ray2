export interface RenderBounds {
  min: [number, number, number];
  max: [number, number, number];
}

export interface RenderPrimitiveRange {
  materialIndex: number;
  indexStart: number;
  indexCount: number;
}

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

export interface RenderInstance {
  id: string;
  geometryId: string;
  worldMatrix: Float32Array;
  visible: boolean;
  materialOverrides?: number[];
}

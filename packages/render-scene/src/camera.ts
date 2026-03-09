export interface RenderCamera {
  id: string;
  worldMatrix: Float32Array;
  projectionType: "perspective";
  verticalFovRadians: number;
  aspectRatio: number;
  near: number;
  far: number;
}

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

export type RenderLight =
  | RenderDirectionalLight
  | RenderPointLight
  | RenderSpotLight;

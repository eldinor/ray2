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

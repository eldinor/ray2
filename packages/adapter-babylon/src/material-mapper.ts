import { MultiMaterial } from "@babylonjs/core/Materials/multiMaterial";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Material } from "@babylonjs/core/Materials/material";
import type { RenderMaterial } from "@ray2/render-scene";

import { registerTexture, type TextureRegistry } from "./texture-extractor";

export interface MaterialMapResult {
  material: RenderMaterial;
  warnings: string[];
}

export interface MaterialMappingContext {
  textureRegistry: TextureRegistry;
}

export function mapMaterial(
  material: Material | null,
  context: MaterialMappingContext,
): MaterialMapResult {
  if (!material) {
    return {
      material: {
        id: "default-material",
        name: "Default Material",
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 0,
        roughnessFactor: 1,
        alphaMode: "opaque",
        doubleSided: false,
      },
      warnings: ["Mesh has no material. Using default placeholder material."],
    };
  }

  if (material instanceof MultiMaterial) {
    return {
      material: {
        id: material.id,
        name: material.name,
        baseColorFactor: [1, 1, 1, material.alpha],
        metallicFactor: 0,
        roughnessFactor: 1,
        alphaMode: getAlphaMode(material),
        alphaCutoff: material.needAlphaTesting() ? 0.5 : undefined,
        doubleSided: !material.backFaceCulling,
      },
      warnings: ["MultiMaterial is represented through submesh ranges, not as a standalone surface material."],
    };
  }

  if (material instanceof PBRMaterial) {
    return {
      material: {
        id: material.id,
        name: material.name,
        baseColorFactor: [
          material.albedoColor.r,
          material.albedoColor.g,
          material.albedoColor.b,
          material.alpha,
        ],
        metallicFactor: material.metallic ?? 0,
        roughnessFactor: material.roughness ?? 1,
        emissiveFactor: [
          material.emissiveColor.r,
          material.emissiveColor.g,
          material.emissiveColor.b,
        ],
        normalTextureIndex: registerTexture(
          material.bumpTexture,
          context.textureRegistry,
        ),
        baseColorTextureIndex: registerTexture(
          material.albedoTexture,
          context.textureRegistry,
        ),
        metallicRoughnessTextureIndex: registerTexture(
          material.metallicTexture,
          context.textureRegistry,
        ),
        emissiveTextureIndex: registerTexture(
          material.emissiveTexture,
          context.textureRegistry,
        ),
        alphaMode: getAlphaMode(material),
        alphaCutoff: material.alphaCutOff,
        doubleSided: !material.backFaceCulling,
      },
      warnings: [],
    };
  }

  if (material instanceof StandardMaterial) {
    return {
      material: {
        id: material.id,
        name: material.name,
        baseColorFactor: [
          material.diffuseColor.r,
          material.diffuseColor.g,
          material.diffuseColor.b,
          material.alpha,
        ],
        metallicFactor: 0,
        roughnessFactor: clamp(material.roughness, 0, 1),
        emissiveFactor: [
          material.emissiveColor.r,
          material.emissiveColor.g,
          material.emissiveColor.b,
        ],
        normalTextureIndex: registerTexture(
          material.bumpTexture,
          context.textureRegistry,
        ),
        baseColorTextureIndex: registerTexture(
          material.diffuseTexture,
          context.textureRegistry,
        ),
        emissiveTextureIndex: registerTexture(
          material.emissiveTexture,
          context.textureRegistry,
        ),
        alphaMode: getAlphaMode(material),
        alphaCutoff: material.alphaCutOff,
        doubleSided: !material.backFaceCulling,
      },
      warnings: [],
    };
  }

  return {
    material: {
      id: material.id,
      name: material.name,
      baseColorFactor: [1, 1, 1, 1],
      metallicFactor: 0,
      roughnessFactor: 1,
      alphaMode: getAlphaMode(material),
      doubleSided: !material.backFaceCulling,
    },
    warnings: [`Unsupported Babylon material type "${material.getClassName()}". Falling back to defaults.`],
  };
}

function getAlphaMode(material: Material): RenderMaterial["alphaMode"] {
  if (material.needAlphaBlending()) {
    return "blend";
  }

  if (material.needAlphaTesting()) {
    return "mask";
  }

  return "opaque";
}

function clamp(value: number | undefined, min: number, max: number): number {
  if (value === undefined) {
    return max;
  }

  return Math.min(max, Math.max(min, value));
}

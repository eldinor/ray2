import type { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import type { RenderTexture } from "@ray2/render-scene";

export interface TextureRegistry {
  add(texture: RenderTexture): number;
}

export function registerTexture(
  texture: BaseTexture | null | undefined,
  registry: TextureRegistry,
): number | undefined {
  if (!texture) {
    return undefined;
  }

  const size = texture.getSize();

  return registry.add({
    id: texture.uid,
    name: texture.name || texture.displayName || undefined,
    width: size.width,
    height: size.height,
    colorSpace: texture.gammaSpace ? "srgb" : "linear",
  });
}

import type { RenderScene, RenderSettings } from "@ray2/render-scene";

import { FULLSCREEN_SHADER } from "./shader";
import type {
  MinimalRenderInputs,
  ProgressiveRenderer,
  WebGpuBufferLike,
  WebGpuCanvasContextLike,
  WebGpuDeviceLike,
  WebGpuRenderPipelineLike,
} from "./types";

// The WGSL uniform struct is padded to 64 bytes because it contains a vec3f.
const UNIFORM_STRIDE = 16 * Float32Array.BYTES_PER_ELEMENT;
const GPU_BUFFER_USAGE_UNIFORM = 0x40;
const GPU_BUFFER_USAGE_COPY_DST = 0x08;
const GPU_TEXTURE_USAGE_RENDER_ATTACHMENT = 0x10;

export interface CreateProgressiveRendererOptions {
  canvas: OffscreenCanvas;
  context: WebGpuCanvasContextLike;
  device: WebGpuDeviceLike;
  format: string;
}

export function createProgressiveRenderer(
  options: CreateProgressiveRendererOptions,
): ProgressiveRenderer {
  const uniformBuffer = options.device.createBuffer({
    size: UNIFORM_STRIDE,
    usage: GPU_BUFFER_USAGE_UNIFORM | GPU_BUFFER_USAGE_COPY_DST,
  });
  const bindGroupLayout = options.device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: 0x1 | 0x2,
        buffer: { type: "uniform" },
      },
    ],
  });
  const bindGroup = options.device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: uniformBuffer },
      },
    ],
  });
  const pipeline = createPipeline(options.device, bindGroupLayout, options.format);
  let activeScene: RenderScene | null = null;
  let activeSettings: RenderSettings | null = null;

  options.context.configure({
    device: options.device,
    format: options.format,
    alphaMode: "opaque",
    usage: GPU_TEXTURE_USAGE_RENDER_ATTACHMENT,
  });

  return {
    resize(width, height) {
      options.canvas.width = Math.max(1, Math.round(width));
      options.canvas.height = Math.max(1, Math.round(height));
    },
    loadScene(scene, settings) {
      activeScene = scene;
      activeSettings = settings;
      this.resize(settings.width, settings.height);
    },
    renderSample(inputs: MinimalRenderInputs) {
      activeScene = inputs.scene;
      activeSettings = inputs.settings;
      this.resize(inputs.settings.width, inputs.settings.height);

      const currentScene = activeScene;
      const currentSettings = activeSettings;

      if (!currentScene || !currentSettings) {
        return;
      }

      options.device.queue.writeBuffer(
        uniformBuffer,
        0,
        Float32Array.from([
          currentSettings.width,
          currentSettings.height,
          inputs.sampleCount,
          currentSettings.fireflyClamp ?? 10,
          currentScene.geometries.length,
          currentScene.instances.length,
          currentScene.materials.length,
          currentSettings.exposure ?? 1,
          tonemappingToNumber(currentSettings.tonemapping),
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ]),
      );

      const encoder = options.device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: options.context.getCurrentTexture().createView(),
            clearValue: { r: 0.03, g: 0.05, b: 0.08, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });

      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3, 1, 0, 0);
      pass.end();

      options.device.queue.submit([encoder.finish()]);
    },
    dispose() {
      destroyBuffer(uniformBuffer);
      options.device.destroy?.();
    },
  };
}

function createPipeline(
  device: WebGpuDeviceLike,
  bindGroupLayout: unknown,
  format: string,
): WebGpuRenderPipelineLike {
  const shaderModule = device.createShaderModule({
    code: FULLSCREEN_SHADER,
  });

  return device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    vertex: {
      module: shaderModule,
      entryPoint: "vsMain",
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fsMain",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });
}

function destroyBuffer(buffer: WebGpuBufferLike): void {
  buffer.destroy?.();
}

function tonemappingToNumber(
  tonemapping: RenderSettings["tonemapping"] | undefined,
): number {
  switch (tonemapping) {
    case "none":
      return 0;
    case "reinhard":
      return 1;
    case "aces":
      return 2;
    default:
      return 2;
  }
}

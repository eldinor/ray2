import type { RenderScene, RenderSettings } from "@ray2/render-scene";

export interface MinimalRenderInputs {
  scene: RenderScene;
  settings: RenderSettings;
  sampleCount: number;
}

export interface ProgressiveRenderer {
  resize(width: number, height: number): void;
  loadScene(scene: RenderScene, settings: RenderSettings): void;
  renderSample(inputs: MinimalRenderInputs): void;
  dispose(): void;
}

export interface WebGpuCanvasContextLike {
  configure(configuration: {
    device: WebGpuDeviceLike;
    format: string;
    alphaMode: "opaque" | "premultiplied";
    usage?: number;
  }): void;
  getCurrentTexture(): {
    createView(): unknown;
  };
}

export interface WebGpuRenderPassEncoderLike {
  setPipeline(pipeline: unknown): void;
  setBindGroup(index: number, bindGroup: unknown): void;
  draw(
    vertexCount: number,
    instanceCount?: number,
    firstVertex?: number,
    firstInstance?: number,
  ): void;
  end(): void;
}

export interface WebGpuCommandEncoderLike {
  beginRenderPass(descriptor: object): WebGpuRenderPassEncoderLike;
  finish(): unknown;
}

export interface WebGpuQueueLike {
  writeBuffer(
    buffer: WebGpuBufferLike,
    bufferOffset: number,
    data: Float32Array,
  ): void;
  submit(commands: unknown[]): void;
}

export interface WebGpuBufferLike {
  destroy?(): void;
}

export interface WebGpuDeviceLike {
  queue: WebGpuQueueLike;
  createShaderModule(descriptor: { code: string }): unknown;
  createBuffer(descriptor: { size: number; usage: number }): WebGpuBufferLike;
  createBindGroupLayout(descriptor: object): unknown;
  createBindGroup(descriptor: object): unknown;
  createPipelineLayout(descriptor: object): unknown;
  createRenderPipeline(descriptor: object): unknown;
  createCommandEncoder(): WebGpuCommandEncoderLike;
  destroy?(): void;
}

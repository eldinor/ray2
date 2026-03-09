export const FULLSCREEN_SHADER = /* wgsl */ `
struct Uniforms {
  resolution: vec2f,
  sample_count: f32,
  firefly_clamp: f32,
  geometry_count: f32,
  instance_count: f32,
  material_count: f32,
  exposure: f32,
  tonemap_mode: f32,
  padding: vec3f,
};

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vsMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var positions = array<vec2f, 3>(
    vec2f(-1.0, -3.0),
    vec2f(-1.0, 1.0),
    vec2f(3.0, 1.0),
  );

  let position = positions[vertexIndex];
  var output: VertexOutput;
  output.position = vec4f(position, 0.0, 1.0);
  output.uv = position * 0.5 + vec2f(0.5, 0.5);
  return output;
}

@fragment
fn fsMain(input: VertexOutput) -> @location(0) vec4f {
  let pulse = 0.5 + 0.5 * sin(uniforms.sample_count * 0.08);
  let structure = vec3f(
    input.uv.x,
    input.uv.y,
    0.2 + 0.15 * pulse
  );
  let sceneTint = vec3f(
    0.08 * uniforms.geometry_count,
    0.05 * uniforms.instance_count,
    0.03 * uniforms.material_count
  );
  var color = structure + sceneTint + vec3f(0.1, 0.16, 0.24);
  color = min(color, vec3f(uniforms.firefly_clamp));
  color = color * uniforms.exposure;

  if (uniforms.tonemap_mode > 1.5) {
    color = saturate((color * (2.51 * color + vec3f(0.03))) / (color * (2.43 * color + vec3f(0.59)) + vec3f(0.14)));
  } else if (uniforms.tonemap_mode > 0.5) {
    color = color / (vec3f(1.0) + color);
  }

  return vec4f(color, 1.0);
}
`;

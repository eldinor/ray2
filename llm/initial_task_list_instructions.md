# Initial Task List Instructions

## Rule
Complete tasks in order. Keep changes small and architecture-safe.

## Task 1 — Workspace and tooling
Set up:
- Vite
- TypeScript
- ESLint
- monorepo or package structure
- scripts: `dev`, `lint`, `typecheck`, `build`

Validation:
- install works
- Vite app starts
- lint runs successfully

## Task 2 — Neutral scene package
Create `packages/render-scene` with:
- scene interfaces
- geometry
- materials
- textures
- lights
- camera
- environment
- snapshot result
- render settings

Validation:
- no Babylon imports
- strict typing

## Task 3 — Babylon adapter skeleton
Create `packages/adapter-babylon` with:
- `extract-snapshot.ts`
- `material-mapper.ts`
- `texture-extractor.ts`
- `screenshot.ts`

Validation:
- package can import Babylon
- safe placeholder snapshot possible

## Task 4 — Renderer controller skeleton
Create `packages/renderer-controller` that:
- stores UI state
- handles Render action
- coordinates snapshot and worker calls

## Task 5 — Render worker skeleton
Create `packages/render-worker`:
- worker entry
- typed protocol
- WebGPU init stub
- message handling

## Task 6 — Unified viewport shell
Create UI with:
- one viewport
- Render button
- Reset button
- blend slider
- view mode selector
- post-snapshot mode selector
- stats placeholders

## Task 7 — Babylon screenshot capture
Capture reference screenshot at snapshot moment.

## Task 8 — Minimal snapshot extraction
Extract:
- one camera
- visible meshes
- positions
- indices
- transforms
- basic materials

Scope:
- static opaque meshes only

## Task 9 — CPU BVH package
Build initial BVH from extracted triangles.

## Task 10 — Connect controller to worker
Flow:
1. Render click
2. screenshot
3. snapshot
4. optional pause/dispose
5. send scene to worker

## Task 11 — Minimal GPU rendering
Implement first visible progressive render.

## Task 12 — Blend and view modes
Support:
- Babylon only
- Path tracer only
- Blend
- Difference

## Task 13 — Basic render controls
Add:
- samples
- max bounces
- resolution
- firefly clamp
- exposure
- tonemapping

## Task 14 — Pause/dispose behavior
Implement:
- keep
- pause
- dispose

## Task 15 — Example scenes
Provide:
- simple box
- PBR spheres
- imported GLB

## Iteration Policy
After each task:
- run lint
- run targeted type checks if needed
- verify manually

Do **not** run full build after every task.

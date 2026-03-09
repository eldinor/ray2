# Project Skeleton Instructions

## Purpose
Provide the AI agent with a stable repository structure so code is placed in the correct layer and architecture boundaries remain clean.

## Required Stack
- **Build tool:** Vite
- **Language:** TypeScript
- **Package manager:** pnpm preferred
- **Quality gate during iteration:** **lint, do not build every time**
- **Rendering backend:** WebGPU
- **Workers:** Web Workers

## Recommended Repository Structure

```text
project-root/
├─ apps/
│  └─ viewer/
│     ├─ index.html
│     ├─ vite.config.ts
│     ├─ tsconfig.json
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ app/
│     │  ├─ ui/
│     │  ├─ controllers/
│     │  ├─ workers/
│     │  └─ styles/
│     └─ public/
│
├─ packages/
│  ├─ render-scene/
│  ├─ render-bvh/
│  ├─ render-core/
│  ├─ render-worker/
│  ├─ renderer-controller/
│  ├─ adapter-babylon/
│  └─ ui-model/
│
├─ examples/
├─ docs/
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ eslint.config.js
└─ .gitignore
```

## Layer Ownership Rules
- `render-scene`: neutral types only, no Babylon, no DOM
- `adapter-babylon`: only package allowed to import Babylon
- `render-bvh`: CPU BVH logic only
- `render-core`: renderer-side logic only
- `render-worker`: WebGPU worker code and protocol
- `renderer-controller`: orchestration between UI, adapter, and worker
- `ui-model`: typed UI state and settings
- `apps/viewer`: Vite app shell and UI wiring

## Important Constraint
Do **not** collapse all code into the Vite app.
Keep reusable renderer logic inside `packages/`.

## Development Rule
During normal AI iteration:
- run **lint**
- run targeted type checks when needed
- **do not run full production build after every change**

Use full build only at milestone checkpoints.

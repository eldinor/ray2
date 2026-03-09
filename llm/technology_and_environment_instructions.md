# Technology and Environment Instructions

## Required Technology Choices
- **Frontend app:** Vite
- **Language:** TypeScript
- **Rendering:** WebGPU
- **Shaders:** WGSL
- **Workers:** Web Workers
- **Quality gate:** lint first, do not build each time

## UI Choice
Either is acceptable:
- vanilla TypeScript + HTML/CSS
- React + TypeScript

For MVP, prefer:
- **vanilla TypeScript + HTML/CSS**

## Environment Requirements
- modern Chromium browser with WebGPU
- Node.js 20+
- TypeScript 5+
- pnpm preferred

## Build and Validation Policy

### Normal iteration
- run lint
- run targeted type checks if needed
- do **not** run a full build after every change

### Full build
Run full build only:
- after major milestones
- before release candidates
- when validating packaging/integration issues

## Recommended Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

## Suggested Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "build": "vite build"
  }
}
```

## Strictness
Use strict TypeScript and explicit interfaces.
Avoid `any` except for tightly isolated interop.

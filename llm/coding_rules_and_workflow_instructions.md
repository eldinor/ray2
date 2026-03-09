# Coding Rules and Workflow Instructions

## Hard Rules
1. `render-scene`, `render-core`, and `render-bvh` must not import Babylon.
2. Only `adapter-babylon` may import Babylon.
3. Workers must not access the DOM directly.
4. UI must not implement renderer internals.
5. Controller owns lifecycle orchestration.
6. Do not require live Babylon objects after snapshot.
7. Keep worker message types explicit and typed.
8. Prefer small typed modules over giant files.

## Development Workflow

### Normal coding loop
1. implement a small step
2. run lint
3. run targeted type check if needed
4. manually verify
5. continue

### Do not
- run production build after every small change
- add advanced features before MVP works
- mix adapter logic with renderer core
- use `any` casually in public contracts

## Validation Cadence
- Frequent: `pnpm lint`
- Often: `pnpm typecheck`
- Milestones only: `pnpm build`

## Testing Priority
1. architecture boundaries
2. scene extraction correctness
3. camera alignment
4. worker protocol correctness
5. basic rendering correctness
6. UI behavior

# Example Scenes and Validation Instructions

## Required Initial Example Scenes

### Example 1 — Simple box
Use to validate:
- camera extraction
- geometry extraction
- screenshot alignment
- first render path

### Example 2 — PBR spheres
Use to validate:
- material mapping
- reflections
- lighting correctness

### Example 3 — Imported GLB
Use to validate:
- GLB import through Babylon
- snapshot extraction from Babylon-native objects
- submesh/material extraction

## Validation Checklist

### Snapshot validation
- screenshot captured
- extracted camera matches framing
- geometry count is reasonable
- materials count is reasonable
- warnings shown for unsupported features

### Render validation
- worker receives scene
- image appears in viewport
- progressive updates visible
- blend mode works

### Post-snapshot validation
- pause mode works
- dispose mode works
- reference screenshot still displays

## Comparison Modes
Validate:
- Babylon only
- Path tracer only
- Blend
- Difference

## Recommended Folder Layout

```text
examples/
├─ simple-box/
├─ pbr-spheres/
└─ glb-model/
```

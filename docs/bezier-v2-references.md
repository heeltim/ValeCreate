# Bézier V2 reference notes

This document maps open-source references to reusable concepts for the in-house Fabric-based Bézier V2 implementation.

## Candidate references

1. **Paper.js** (MIT)
   - Repo: https://github.com/paperjs/paper.js
   - Useful for: path segment model, handle in/out math, smoothing operations.
   - Adaptation strategy: reuse math concepts only, not scene graph architecture.

2. **React Bézier Spline Editor examples**
   - Useful for: UX sequencing (select vs edit vs handles), visual affordances (+/- cursor states), node insertion/removal semantics.
   - Adaptation strategy: interaction behavior mapping, not React component architecture.

3. **Bezier.js / de Casteljau resources**
   - Useful for: robust curve split at parameter `t` when inserting nodes on a segment.
   - Adaptation strategy: keep existing split approach but verify against canonical formulas.

## Planned extraction for GoBrand

- Keep a pure model-first API for V2 (`vectorModelV2`) and render to Fabric path commands.
- Preserve explicit interaction states (`idle`, `selection`, `edit`, `edit-handles`, `creating`).
- Keep path insert/remove and handle coupling logic as pure geometry utilities where possible.

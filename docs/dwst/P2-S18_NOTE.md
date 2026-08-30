# P2-S18 / P2-S19 Direct-Evidence Note

Original evidence recorded on 2026-08-27. This note preserves the historical finding while distinguishing it from the current tree.

## P2-S18 — Legacy geographic distance math

The original direct inspection found a local `km()` helper in `src/dwst/core/detection.ts` that treated longitude/latitude as a local Cartesian plane using degree deltas, a fixed `111` km factor, latitude cosine scaling, and `Math.hypot`.

That duplicate distance implementation was superseded by the canonical geographic-distance operation. The current architecture uses `WorldPosition` as the physical location authority and keeps geographic distance calculation explicit; map/screen coordinate conversion remains outside DWST Core.

**Current status:** resolved constraint / historical finding. The historical implementation details above must not be read as a statement that the legacy helper remains operational.

## P2-S19 — Era-aware detection policy

The original note observed that the generic combat pipeline invoked `detectContacts(state)` and that era-specific detection policy had not yet been exposed. The current `EraRuleset` now owns a readonly `DetectionPolicy`, while the generic detection/contact bookkeeping remains Core-owned.

This preserves one detection pipeline while allowing era-specific parameters without duplicating detector implementations. Further detection realism remains downstream B-series scope where identified by the master plan.

**Current status:** architectural direction established; downstream detection realism remains separate work.

## Legacy geographic-distance audit scope

The historical audit scope remains useful for future regressions:

- direct `lon` / `lat` delta arithmetic used as physical distance;
- fixed kilometers-per-degree constants;
- cosine-scaled longitude distance approximations;
- `Math.hypot` / `Math.sqrt` over geographic coordinate deltas;
- duplicate haversine/great-circle implementations;
- antimeridian-unsafe absolute longitude differences;
- old x/y battlefield distance helpers accidentally operating on canonical `WorldPosition`.

The audit must distinguish legitimate local/screen/projection coordinates from physical geographic-distance calculations. UI/map conversion remains outside DWST Core and is owned by the ORBAT Mapper/map boundary.

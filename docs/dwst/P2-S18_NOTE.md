# P2-S18 / P2-S19 Direct-Evidence Note

Recorded before implementation on 2026-08-27.

## P2-S18 — Legacy geographic distance math remained in canonical detection

Direct inspection of `src/dwst/core/detection.ts` found a local `km()` helper that treated longitude/latitude as a local Cartesian plane using degree deltas, a fixed `111` km factor, latitude cosine scaling, and `Math.hypot`.

This duplicated and contradicted the canonical geographic semantics introduced for engine movement in `geographicMovement.ts`.

Required correction:

- use `geographicDistanceMeters()` as the single DWST core geographic distance operation;
- convert meters to kilometers only at the detection-domain boundary;
- do not create local x/y coordinates or import the UI/map adapter.

## P2-S19 — Detection behavior is currently universal core logic

Direct inspection shows the generic combat pipeline invokes `detectContacts(state)` before era combat resolution, while `EraRuleset` currently has no detection-policy hook.

The core loop/contact bookkeeping should remain canonical and shared. The audit question is whether era-specific detection modifiers should be exposed through a minimal ruleset-owned policy rather than duplicating full detector implementations by era.

No P2-S19 implementation is authorized by this note alone; it requires further direct evidence after P2-S18 is CI-validated.

## Legacy geographic-distance audit scope

Searches must explicitly cover surviving legacy patterns, including:

- direct `lon` / `lat` delta arithmetic used as physical distance;
- fixed kilometers-per-degree constants;
- cosine-scaled longitude distance approximations;
- `Math.hypot` / `Math.sqrt` over geographic coordinate deltas;
- duplicate haversine/great-circle implementations;
- antimeridian-unsafe absolute longitude differences;
- old x/y battlefield distance helpers accidentally operating on canonical `WorldPosition`.

The audit must distinguish legitimate local/screen/projection coordinates from physical geographic-distance calculations. UI/map conversion remains outside DWST core and is owned by the ORBAT Mapper/map boundary.

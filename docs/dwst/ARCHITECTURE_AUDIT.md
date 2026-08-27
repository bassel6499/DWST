# DWST architecture audit

Date: 2026-08-27

## Purpose
DWST is a deterministic analytical simulation tool, not a game. Scenario content, era assumptions, historical data, and UI/map concerns must not contaminate the simulation kernel.

## Findings

### 1. Two state models currently coexist
- `core/types.ts` defines `ScenarioState`/`UnitState` using geographic `{lon,lat}` positions.
- `core/oob.ts` defines a hierarchical `OrderOfBattle` containing formations plus the same `UnitState` objects.
- `core/simulationState.ts` defines a second top-level state containing OOB + a separate battlefield model.

**Decision:** `ScenarioState` is retained as the compatibility surface for the existing engine. `simulationState.ts` and `resolveTurn.ts` are provisional integration prototypes and must not become a second authoritative state model.

### 2. Two spatial representations coexist
- `UnitState.position` uses longitude/latitude.
- `BattlefieldState` uses local Cartesian kilometres `{x,y}`.

**Decision:** do not silently convert between these systems. A future geometry adapter must make coordinate reference systems explicit. Until then, each layer keeps its own representation.

### 3. Combat implementations overlap
There are legacy/base combat modules and newer combat-resolution/integration modules. They currently encode overlapping effectiveness and attrition concepts.

**Decision:** no combat module is authoritative until the formula contract is specified and regression-tested. In particular, coefficients must not be tuned merely to produce attractive outcomes.

### 4. Equipment accounting is duplicated
`UnitState.equipment` is a scalar while `EquipmentPool` tracks operational/damaged/destroyed equipment by type.

**Decision:** EquipmentPool becomes the detailed accounting source. The scalar field is compatibility-only and must not be independently mutated once the integration layer is finalized.

### 5. Crew accounting is appropriately separate
Crew pools already distinguish specialist categories and experience levels. Personnel casualties must not automatically create crews. Specialist qualification must come from explicit training or imported qualified reinforcements.

### 6. Era vocabulary was inconsistent
`core/types.ts` includes `industrial`, `interwar`, `early-cold-war`, and `late-cold-war`, while the first era-rules implementation did not. `eraRules.ts` has now been aligned with the canonical vocabulary.

## Non-negotiable invariants
1. Deterministic: identical inputs and state produce identical outputs.
2. No implicit replacements.
3. Destroyed personnel/equipment remain destroyed until an explicit, auditable reconstitution pipeline changes state.
4. Crew qualification is tied to specialist training or explicitly qualified reinforcement.
5. Scenario data cannot alter core formulas by side effect.
6. Historical claims require provenance; the engine does not invent OOB data.
7. UI/map rendering is a presentation layer and cannot modify simulation mathematics.
8. External map/ORBAT services are adapters, not sources of truth for combat resolution.
9. Every formula parameter used in a resolution must be inspectable in the scenario/ruleset configuration.
10. AAR calculations must be reproducible from the saved initial state plus the ordered command log.

## Refactor sequence
1. Freeze feature additions.
2. Establish canonical simulation state and explicit adapters for legacy state.
3. Establish canonical equipment and crew accounting.
4. Establish a versioned era/model contract containing formulas and coefficients.
5. Make combat resolution pure: input snapshot -> result delta; no hidden mutation.
6. Make sustainment pure and explicit about resource deltas.
7. Make the turn engine the only component allowed to commit state changes.
8. Add deterministic regression fixtures before historical scenarios.
9. Add Ardennes as scenario data only after the kernel passes fixtures.
10. Add ORBAT Mapper/map integration only as a presentation/import/export adapter.

## Current status
The existing new modules are considered **prototype integration work**, not validated production mathematics. This is intentional and prevents premature coupling to Ardennes or any one era.

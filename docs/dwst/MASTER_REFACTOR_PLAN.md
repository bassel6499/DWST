# DWST Master Refactor Plan

## Governing rules

1. **Direct evidence only.** No architectural change, ruling, deletion, or compatibility decision may be based on speculation. Use direct repository observation, tests/CI evidence, or verified external research.
2. **CI is a gate, not proof of architecture.** Green CI proves the checked behavior/build passes; it does not by itself prove that an architecture is canonical.
3. **One authoritative physical position.** A simulated unit has one authoritative physical position: `UnitState.position: WorldPosition`.
4. **ORBAT Mapper is the map authority.** DWST must not implement a competing map projection/rendering/mapping system. DWST supplies geographic positions and simulation results; ORBAT Mapper owns map projection and map rendering/conversion at the UI/map boundary.
5. **Derived coordinates are not state authority.** Any grid/local/map-library coordinate must be derived from canonical geographic position through an explicit, verified reference/conversion. It must never become a second physical location.
6. **No information fabrication.** Migration adapters must not invent personnel, equipment, crew, coordinates, terrain, or other state that cannot be established from authoritative inputs.
7. **Delete only after proving zero required consumers.** Legacy code remains until its live dependencies are migrated and CI proves the replacement.
8. **Record new findings.** Every newly confirmed architectural defect or requirement discovered during the audit must be added here before acting on it.
9. **Era neutrality is mandatory.** WW2, Cold War, modern, future, and hypothetical behavior are selectable rulesets/scenarios; none may define or contaminate the era-agnostic core mechanics.

## Phase 2 — Canonical state / spatial consolidation

### Completed / verified

- Canonical `UnitState` uses `WorldPosition` (`lon`, `lat`).
- Canonical `ScenarioState` and `resolveTurn()` / `applyTurn()` establish a pure-resolution plus explicit-application boundary.
- Canonical resource state remains an aggregate/resource authority and does not replace the individual personnel registry.
- Redundant simulation-step cloning was removed and CI subsequently passed.
- The map-facing DWST path consumes canonical scenario state and geographic positions.
- `DwstMapOverlay.vue` duplicate `defineProps` declaration was removed; CI run `33100195482` passed type-check and unit tests.
- The active WW2 demo entry point was migrated from `runWW2Turn()` to the generic `simulateTurn()` path and CI run `33106939476` passed type-check and unit tests.
- The duplicate WW2 square-law implementation was consolidated into the selectable WW2 scenario layer; the old `core/ww2SquareLaw.ts` implementation was removed and CI runs `33107940693` and `33107899018` passed type-check and unit tests.
- Standalone `src/dwst/core/battlefield.ts` was removed after direct evidence showed zero current repository-search consumers for its public `BattlefieldState`, `moveUnit`, and `terrainAt` contract.
- Direct inspection confirms canonical spatial state is already represented at the correct level: `UnitState.position: WorldPosition`. Spatial state therefore does **not** belong in `CanonicalState`, which remains resource/personnel/equipment authority.

### Confirmed remaining architecture problems

#### P2-S1 — Two operational turn-resolution models

`resolveUnifiedTurn()` operates on `SimulationState`/legacy battlefield state and mutates it directly, while canonical `resolveTurn()` operates on `ScenarioState` and is documented as pure. These are materially different execution models.

**Status:** Confirmed. Migration required, but callers must be established before changing/removing the legacy contract.

#### P2-S2 — Duplicate spatial representations

Legacy `BattlefieldState` stores `Position { x, y }` and movement/detection operate on those coordinates. Canonical `UnitState` stores geographic `WorldPosition { lon, lat }`.

**Status:** Partially resolved. The standalone legacy battlefield implementation in `core/battlefield.ts` had zero current repository-search consumers and has been removed. Remaining P2-S2 work concerns any hidden/renamed spatial representation and any legacy state still embedded elsewhere; these must be checked through direct source inspection.

#### P2-S3 — Duplicate detection implementations

`detection.ts` contains canonical `detectContacts(ScenarioState, ...)` using `WorldPosition` and a compatibility `detect(BattlefieldState, ...)` using local `x/y` coordinates.

**Status:** Confirmed. The legacy detector must be retired only after its consumers and required behavior are migrated.

#### P2-S4 — No verified DWST conversion from legacy `x/y` to geographic position

The audit has not established a valid semantic mapping between legacy battlefield `x/y` and canonical `WorldPosition`. Therefore no implicit conversion may be invented.

**Status:** Confirmed constraint.

#### P2-S5 — ORBAT Mapper owns map-coordinate conversion

Verified mature ORBAT Mapper evidence shows a `MapAdapter` contract with `toLonLat()` / `fromLonLat()` and related coordinate operations. This establishes an existing host map conversion boundary.

**Status:** Confirmed architectural integration point. DWST should not create a competing map projection.

#### P2-S6 — Legacy battlefield state remains live

`SimulationState` still contains `BattlefieldState`, and the legacy resolver uses it for movement and detection. Previous removal attempts caused concrete CI failures from remaining consumers.

**Status:** Historically confirmed. The standalone `core/battlefield.ts` implementation has now been removed. Any remaining `BattlefieldState` references must be treated separately and verified directly.

#### P2-S7 — Map/simulation spatial consistency invariant needs executable protection

The architecture requires one authoritative geographic position. A future invariant test should prove that any displayed/derived map position is derived from the same canonical `WorldPosition` and cannot silently diverge into a second physical location.

**Status:** Confirmed requirement; test design pending direct evidence of the host integration boundary.

#### P2-S8 — WW2 orchestration resides in `core`

Direct inspection confirmed `src/dwst/core/ww2.ts` contained WW2-specific combat and turn orchestration (`resolveWW2Combat`, `runWW2Turn`). The generic engine/ruleset architecture already defines `EraRuleset` and a selectable WW2 ruleset. Keeping a WW2 turn orchestrator inside `core` risked making WW2 behavior part of the core execution architecture.

**Status:** Migration completed at the active entry point. `DwstDemoView.vue` now uses generic `simulateTurn()`. `core/ww2.ts` is retained only as a deprecated compatibility shim while remaining consumers are proven.

#### P2-S9 — Canonical combat already owns canonical detection indirectly

A previous audit hypothesis treated detection as absent from the canonical WW2 path. Direct inspection corrected that: `resolveEngagements()` calls canonical `detectContacts(state)` before invoking the selected era's `resolveCombat`. Therefore the remaining problem is not the absence of canonical detection mechanics; it is ensuring the canonical turn architecture exposes and composes detection correctly without reviving the legacy `BattlefieldState` detector.

**Status:** Corrected finding. Do not create a second canonical detection engine or falsely classify detection as missing.

#### P2-S10 — Duplicate WW2 combat implementation across core and scenario layers

Direct inspection found the same WW2 square-law combat implementation represented both in `core/ww2SquareLaw.ts` and the new selectable WW2 scenario module. This duplicates an era-specific mechanic across architectural layers and risks future divergence.

**Status:** Resolved. The canonical WW2 square-law implementation is now in `scenarios/ww2/combat.ts`, the generic era registry is bound to that scenario-owned implementation, the old `core/ww2SquareLaw.ts` has been removed, and CI runs `33107940693` and `33107899018` passed type-check and unit tests.

#### P2-S12 — Standalone legacy battlefield module has zero current consumers

Direct repository evidence found `src/dwst/core/battlefield.ts` contains a complete parallel `BattlefieldState`/`Position {x,y}` model plus `terrainAt()` and `moveUnit()`. Repository searches for `BattlefieldState`, `moveUnit`, `terrainAt`, `position.x`, and `resolveUnifiedTurn` returned no current consumers for this standalone module. This is distinct from any remaining legacy state embedded elsewhere.

**Status:** Resolved. `src/dwst/core/battlefield.ts` was deleted. No replacement battlefield/map module was created.

#### P2-S13 — Canonical resource state does not own spatial state

Direct inspection of `src/dwst/core/canonicalState.ts` confirms `CanonicalState` contains personnel, equipment instances, crew assignments, and equipment definitions, but no spatial position. Direct inspection of `src/dwst/core/types.ts` confirms the canonical physical position already exists on `UnitState.position: WorldPosition`, while `ScenarioState` owns the collection of `UnitState` records and scenario-wide state.

**Status:** Resolved design clarification. Do **not** add `WorldPosition` to `CanonicalState`. Spatial state belongs to `UnitState`/`ScenarioState`; `CanonicalState` remains the canonical resource/personnel/equipment authority.

#### P2-S14 — Legacy `SimulationState` retains deleted battlefield dependency

Direct inspection of `src/dwst/core/simulationState.ts` found that it imports `BattlefieldState`, stores it as `SimulationState.battlefield`, requires it in `createSimulationState()`, and mutates its turn counter in `advanceClock()`. The standalone `core/battlefield.ts` implementation has already been removed, so this module is now part of the retired legacy operational state model.

Direct repository searches found no current consumers for `simulationState`, `SimulationState`, or `createSimulationState` on `audit/canonical-state-refactor`.

**Status:** Confirmed dead legacy dependency. The module is approved for removal; canonical runtime state remains `ScenarioState`, with `UnitState.position: WorldPosition`.

### Next investigation / implementation order

1. Remove the now-dead `simulationState.ts` module and retire the legacy `detect(BattlefieldState, ...)` compatibility path, then run CI.
2. Prove all callers/entry points of `resolveUnifiedTurn()` using direct repository evidence; do not trust false-negative code-search results.
3. Prove all callers of legacy `detect()` and any remaining legacy `moveUnit()` implementation.
4. Preserve/expand tests around observed WW2 movement, combat, sustainment, time, and detection behavior before removing the WW2 compatibility shim.
5. Determine whether the generic engine needs a ruleset-owned detection policy/interface so detection behavior remains era-configurable rather than WW2-specific.
6. Identify the exact ORBAT Mapper integration boundary used by the application for geographic/map conversion.
7. If a verified bridge exists, reuse it. If not, define the smallest explicit interface needed; do not implement an independent projection.
8. Migrate detection consumers to canonical `WorldPosition`.
9. Migrate movement consumers to canonical `WorldPosition`, preserving observed movement behavior through explicit rules/terrain inputs.
10. Migrate terrain/logistics dependencies that currently require legacy battlefield state.
11. Remove the legacy detect and remaining legacy movement implementations only after zero required consumers are proven.
12. Remove `BattlefieldState` from operational state only after migration tests and CI establish that canonical state is sufficient.
13. Remove `core/ww2.ts` only after its active/required callers are migrated and WW2 behavior is covered by the selectable WW2 ruleset.
14. Run a final whole-project audit for duplicate state authority, coordinate systems, era leakage, mutation boundaries, and hidden legacy consumers.

## Findings log

- 2026-08-27: Direct inspection confirmed the canonical map path uses geographic `WorldPosition`.
- 2026-08-27: Direct inspection confirmed legacy battlefield movement/detection use `x/y`.
- 2026-08-27: Direct inspection confirmed canonical `resolveTurn()` and legacy `resolveUnifiedTurn()` have different state/mutation contracts.
- 2026-08-27: Verified mature ORBAT Mapper `MapAdapter` exposes geographic/map coordinate conversion; this is the host map boundary to reuse.
- 2026-08-27: Confirmed DWST currently has no verified semantic conversion from legacy battlefield `x/y` to `WorldPosition`; no such conversion is to be invented.
- 2026-08-27: Confirmed duplicate `defineProps` declaration in `DwstMapOverlay.vue`; removed and validated by green CI run `33100195482`.
- 2026-08-27: Corrected an earlier detection finding: `core/combat.ts` already invokes canonical `detectContacts(state)` during engagement resolution. Detection mechanics therefore exist canonically; the integration/era-neutral composition remains the task.
- 2026-08-27: Confirmed WW2-specific turn orchestration remained in `src/dwst/core/ww2.ts`; active demo caller was migrated to generic `simulateTurn()` and validated by green CI run `33106939476`.
- 2026-08-27: Confirmed duplicate WW2 square-law implementations across core and scenario layers; consolidated the active implementation into the selectable WW2 scenario layer, removed the duplicate core module, and validated with green CI runs `33107940693` and `33107899018`.
- 2026-08-27: Confirmed standalone `src/dwst/core/battlefield.ts` is an independent x/y battlefield state implementation with no current repository-search consumers for its public state/helpers; safely deleted it.
- 2026-08-27: Direct inspection confirmed `CanonicalState` is intentionally resource/personnel/equipment authority only, while `UnitState.position: WorldPosition` is the canonical physical-position field. Do not merge spatial state into the resource state.
- 2026-08-27: Direct inspection confirmed `simulationState.ts` still depended on the deleted `BattlefieldState`; direct searches found no current consumers, so it is approved for removal as dead legacy operational state.

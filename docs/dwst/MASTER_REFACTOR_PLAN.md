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
- The legacy `src/dwst/core/detection.ts` compatibility detector has been reduced to the canonical `detectContacts(ScenarioState, ...)` implementation using `WorldPosition`; the deleted battlefield-based detector is not restored.
- Legacy `src/dwst/core/simulationState.ts` has been removed after direct inspection/search established it was part of the retired operational battlefield model and had no required current consumers.

### Confirmed remaining architecture problems

#### P2-S1 — Two operational turn-resolution models

`resolveUnifiedTurn()` operated on `SimulationState`/legacy battlefield state and mutated it directly, while canonical `resolveTurn()` operates on `ScenarioState` and is documented as pure. These are materially different execution models.

**Status:** Implementation removed for the obsolete resolver; awaiting CI validation of the dependency cleanup. Canonical `resolveTurn()` remains the active generic resolver.

#### P2-S2 — Duplicate spatial representations

Legacy `BattlefieldState` stored `Position { x, y }` while canonical `UnitState` stores geographic `WorldPosition { lon, lat }`.

**Status:** Standalone battlefield implementation removed. Legacy `SimulationState`/battlefield dependency is also removed. Ardennes scenario has been migrated off the x/y battlefield model. Final whole-project verification remains pending CI and direct consumer audit.

#### P2-S3 — Duplicate detection implementations

`detection.ts` previously contained canonical `detectContacts(ScenarioState, ...)` and a compatibility `detect(BattlefieldState, ...)` using local `x/y` coordinates.

**Status:** Resolved in source. `detection.ts` now exposes only canonical `detectContacts()` over `ScenarioState`/`WorldPosition`. CI validation pending.

#### P2-S4 — No verified DWST conversion from legacy `x/y` to geographic position

The audit has not established a valid semantic mapping between legacy battlefield `x/y` and canonical `WorldPosition`. Therefore no implicit conversion may be invented.

**Status:** Confirmed constraint. The Ardennes migration deliberately does not fabricate a coordinate conversion.

#### P2-S5 — ORBAT Mapper owns map-coordinate conversion

Verified mature ORBAT Mapper evidence shows a `MapAdapter` contract with `toLonLat()` / `fromLonLat()` and related coordinate operations. This establishes an existing host map conversion boundary.

**Status:** Confirmed architectural integration point. DWST should not create a competing map projection.

#### P2-S6 — Legacy battlefield state remains live

`SimulationState` previously contained `BattlefieldState`, and the legacy resolver used it for movement and detection. Removal exposed remaining consumers in logistics, resolver, scenario registry, and Ardennes scenario.

**Status:** Cleanup implemented. `core/battlefield.ts`, `core/simulationState.ts`, and the obsolete unified resolver have been removed; remaining dependency validation is a CI gate.

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

Direct inspection of `src/dwst/core/simulationState.ts` found that it imported `BattlefieldState`, stored it as `SimulationState.battlefield`, required it in `createSimulationState()`, and mutated its turn counter in `advanceClock()`. Direct repository searches found no current consumers for `simulationState`, `SimulationState`, or `createSimulationState` on `audit/canonical-state-refactor`.

**Status:** Resolved in source. `src/dwst/core/simulationState.ts` has been deleted. CI validation pending.

#### P2-S15 — WW2 Ardennes scenario still embedded the deleted x/y battlefield model

Direct inspection of `src/dwst/scenarios/ardenne1944.ts` showed the scenario still imported `SimulationState` and `BattlefieldState`, embedded an x/y battlefield with historical features, and constructed the retired operational state. The audit could not establish a verified semantic conversion from those x/y values to geographic `WorldPosition`.

**Status:** Resolved without fabrication. The scenario now constructs canonical `ScenarioState`, retains its WW2 identity, six-hour operational turn scale, weather/terrain/intelligence inputs, and historical objectives, but does not invent geographic coordinates for the old x/y features. Real unit/map geography must enter through authoritative scenario/ORBAT inputs.

#### P2-S16 — Logistics retained a hidden dependency on the deleted battlefield module

Direct inspection of `src/dwst/core/logistics.ts` showed `SupplyRoute` was imported from `./battlefield`, meaning deletion of the standalone battlefield implementation broke an otherwise independent logistics calculation.

**Status:** Resolved in source. `SupplyRoute` is now a local logistics contract containing only the fields required by `resolveSupply()` (`id`, `capacity`, `interdiction`). No battlefield state or coordinates are reintroduced. CI validation pending.

### Next investigation / implementation order

1. Validate the P2-S3/P2-S14/P2-S15/P2-S16 cleanup with CI.
2. Prove all callers/entry points of the removed `resolveUnifiedTurn()` using direct repository evidence; do not trust false-negative code-search results.
3. Prove all callers of any remaining legacy movement implementations.
4. Preserve/expand tests around observed WW2 movement, combat, sustainment, time, and detection behavior before removing the WW2 compatibility shim.
5. Determine whether the generic engine needs a ruleset-owned detection policy/interface so detection behavior remains era-configurable rather than WW2-specific.
6. Identify the exact ORBAT Mapper integration boundary used by the application for geographic/map conversion.
7. If a verified bridge exists, reuse it. If not, define the smallest explicit interface needed; do not implement an independent projection.
8. Migrate any remaining movement consumers to canonical `WorldPosition`, preserving observed movement behavior through explicit rules/terrain inputs.
9. Migrate any remaining terrain/logistics dependencies that require legacy battlefield state.
10. Remove remaining legacy movement implementations only after zero required consumers are proven.
11. Remove `core/ww2.ts` only after its active/required callers are migrated and WW2 behavior is covered by the selectable WW2 ruleset.
12. Add executable spatial-consistency invariants around canonical `WorldPosition` and the map-facing projection boundary.
13. Run a final whole-project audit for duplicate state authority, coordinate systems, era leakage, mutation boundaries, and hidden legacy consumers.

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
- 2026-08-27: Direct inspection confirmed `simulationState.ts` still depended on the deleted `BattlefieldState`; direct searches found no current consumers, so it was removed as dead legacy operational state.
- 2026-08-27: Direct inspection confirmed `detection.ts` still contained a legacy `detect(BattlefieldState, ...)` compatibility implementation after the battlefield module was removed; direct searches found no current consumers, so the compatibility path was removed without altering canonical `detectContacts()`.
- 2026-08-27: CI failures exposed the remaining dependency tail after battlefield removal: `resolveTurn.ts`, `logistics.ts`, `scenarios/registry.ts`, and `scenarios/ardenne1944.ts` still imported deleted legacy state/modules.
- 2026-08-27: Removed obsolete `resolveTurn.ts` unified resolver rather than restoring `BattlefieldState`.
- 2026-08-27: Decoupled logistics from battlefield state by defining the minimal local `SupplyRoute` contract required for supply resolution.
- 2026-08-27: Migrated the Ardennes 1944 scenario to canonical `ScenarioState` without fabricating geographic coordinates for the legacy x/y features.
- 2026-08-27: Migrated scenario registry typing from retired `SimulationState` to canonical `ScenarioState`.

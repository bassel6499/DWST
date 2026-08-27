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
- Direct inspection confirms canonical spatial state is represented at the correct level: `UnitState.position: WorldPosition`. Spatial state does **not** belong in `CanonicalState`, which remains resource/personnel/equipment authority.
- The legacy `src/dwst/core/detection.ts` compatibility detector has been reduced to the canonical `detectContacts(ScenarioState, ...)` implementation using `WorldPosition`; the deleted battlefield-based detector is not restored.
- Legacy `src/dwst/core/simulationState.ts` has been removed after direct inspection/search established it was part of the retired operational battlefield model and had no required current consumers.
- Default generic engine coefficients are now centralized in `eraRules.ts`; the duplicate local defaults in `engine.ts` were removed.

### Confirmed remaining architecture problems

#### P2-S1 — Two operational turn-resolution models

`resolveUnifiedTurn()` operated on `SimulationState`/legacy battlefield state and mutated it directly, while canonical `resolveTurn()` operates on `ScenarioState` and is documented as pure.

**Status:** Obsolete implementation removed. CI validation of the completed dependency cleanup subsequently passed on the latest green runs.

#### P2-S2 — Duplicate spatial representations

Legacy `BattlefieldState` stored `Position { x, y }` while canonical `UnitState` stores geographic `WorldPosition { lon, lat }`.

**Status:** Resolved. Standalone battlefield implementation, legacy `SimulationState`, and retired x/y Ardennes scenario state have been removed/migrated. The latest cleanup sequence subsequently reached green CI.

#### P2-S3 — Duplicate detection implementations

`detection.ts` previously contained canonical `detectContacts(ScenarioState, ...)` and a compatibility `detect(BattlefieldState, ...)` using local `x/y` coordinates.

**Status:** Resolved. `detection.ts` exposes only canonical `detectContacts()` over `ScenarioState`/`WorldPosition`; latest cleanup CI is green.

#### P2-S4 — No verified DWST conversion from legacy `x/y` to geographic position

The audit has not established a valid semantic mapping between legacy battlefield `x/y` and canonical `WorldPosition`. Therefore no implicit conversion may be invented.

**Status:** Confirmed constraint. The Ardennes migration deliberately does not fabricate a coordinate conversion.

#### P2-S5 — ORBAT Mapper owns map-coordinate conversion

Verified ORBAT Mapper evidence shows a `MapAdapter` contract with `toLonLat()` / `fromLonLat()` and related coordinate operations. This establishes an existing host map conversion boundary.

**Status:** Confirmed architectural integration point. DWST should not create a competing map projection.

#### P2-S6 — Legacy battlefield state remains live

`SimulationState` previously contained `BattlefieldState`, and the legacy resolver used it for movement and detection.

**Status:** Resolved. `core/battlefield.ts`, `core/simulationState.ts`, and the obsolete unified resolver have been removed; the final cleanup sequence subsequently reached green CI.

#### P2-S7 — Map/simulation spatial consistency invariant needs executable protection

The architecture requires one authoritative geographic position. A future invariant test should prove that any displayed/derived map position is derived from the same canonical `WorldPosition` and cannot silently diverge into a second physical location.

**Status:** Confirmed requirement. Host map boundary evidence now identifies the separation to protect; executable tests remain pending after P2-S17 movement semantics are corrected.

#### P2-S8 — WW2 orchestration resides in `core`

Direct inspection confirmed `src/dwst/core/ww2.ts` contained WW2-specific combat and turn orchestration (`resolveWW2Combat`, `runWW2Turn`).

**Status:** Active demo caller migrated to generic `simulateTurn()`. `core/ww2.ts` remains a deprecated compatibility shim until remaining callers are proven and migrated.

#### P2-S9 — Canonical combat already owns canonical detection indirectly

`resolveEngagements()` calls canonical `detectContacts(state)` before invoking the selected era's `resolveCombat`.

**Status:** Corrected finding. Do not create a second canonical detection engine.

#### P2-S10 — Duplicate WW2 combat implementation across core and scenario layers

The same WW2 square-law combat implementation was represented both in `core/ww2SquareLaw.ts` and the selectable WW2 scenario module.

**Status:** Resolved and CI-validated by runs `33107940693` and `33107899018`.

#### P2-S12 — Standalone legacy battlefield module has zero current consumers

`src/dwst/core/battlefield.ts` contained a complete parallel `BattlefieldState`/`Position {x,y}` model plus `terrainAt()` and `moveUnit()`.

**Status:** Resolved. Deleted without creating a replacement battlefield/map module.

#### P2-S13 — Canonical resource state does not own spatial state

`CanonicalState` contains personnel, equipment instances, crew assignments, and equipment definitions, while canonical physical position exists on `UnitState.position: WorldPosition`.

**Status:** Resolved design clarification. Do **not** add `WorldPosition` to `CanonicalState`.

#### P2-S14 — Legacy `SimulationState` retained deleted battlefield dependency

`SimulationState` imported and stored `BattlefieldState`.

**Status:** Resolved. `src/dwst/core/simulationState.ts` deleted; cleanup sequence subsequently green.

#### P2-S15 — WW2 Ardennes scenario embedded the deleted x/y battlefield model

The scenario embedded an x/y battlefield and retired operational state. No verified conversion to `WorldPosition` existed.

**Status:** Resolved without fabrication. Scenario now constructs canonical `ScenarioState`; authoritative geography must enter through scenario/ORBAT inputs.

#### P2-S16 — Logistics retained a hidden dependency on the deleted battlefield module

`SupplyRoute` was imported from `./battlefield` even though supply resolution did not require battlefield state.

**Status:** Resolved. Logistics now owns a minimal local `SupplyRoute` contract; cleanup sequence subsequently green.

#### P2-S17 — Generic engine treats geographic longitude/latitude as Cartesian coordinates

Direct inspection of `src/dwst/core/engine.ts` shows movement currently computes `dx = destination.lon - position.lon`, `dy = destination.lat - position.lat`, uses `Math.hypot(dx, dy)`, and linearly interpolates longitude and latitude. This conflicts with `WorldPosition`'s documented geographic semantics and the rule that local computational coordinates require an explicit spatial reference.

Existing repository evidence also shows the host application already has mature geographic/geodesic tooling and ORBAT Mapper owns UI/map coordinate conversion. Therefore the DWST core must not import `MapAdapter` or create a competing projection.

**Status:** Confirmed. Master-plan entry recorded before implementation. Required fix: introduce a small deterministic core geographic movement operation that accepts canonical `WorldPosition` inputs and returns a canonical `WorldPosition` output, using geographic/geodesic semantics. Do not restore `BattlefieldState`, introduce UI coordinates, or invent a scenario-local projection.

### Next investigation / implementation order

1. **Implement P2-S17:** add a small deterministic geographic movement operation over canonical `WorldPosition` and replace direct lon/lat Cartesian interpolation in the generic engine.
2. Add focused tests for that movement operation, including start/end, zero progress, full progress, dateline-safe behavior where applicable, and position validity.
3. Run CI; do not continue if the canonical spatial correction regresses behavior.
4. Add executable spatial-consistency invariants around canonical `WorldPosition` and the map-facing projection boundary.
5. Prove all callers/entry points of the remaining WW2 compatibility shim using direct repository evidence.
6. Preserve/expand tests around observed WW2 movement, combat, sustainment, time, and detection behavior before removing the shim.
7. Determine whether the generic engine needs a ruleset-owned detection policy/interface so detection behavior remains era-configurable.
8. Identify and formalize the smallest ORBAT Mapper import/export boundary for scenario/unit geographic data; reuse existing GeoJSON/map contracts rather than adding a projection.
9. Run a final whole-project audit for duplicate state authority, coordinate systems, era leakage, mutation boundaries, and hidden legacy consumers.

## Findings log

- 2026-08-27: Direct inspection confirmed canonical map path uses geographic `WorldPosition`.
- 2026-08-27: Direct inspection confirmed legacy battlefield movement/detection used `x/y`.
- 2026-08-27: Direct inspection confirmed canonical `resolveTurn()` and legacy `resolveUnifiedTurn()` had different state/mutation contracts.
- 2026-08-27: Verified ORBAT Mapper `MapAdapter` exposes geographic/map coordinate conversion; this is the host map boundary to reuse.
- 2026-08-27: Confirmed DWST has no verified semantic conversion from legacy battlefield `x/y` to `WorldPosition`; no such conversion is to be invented.
- 2026-08-27: Confirmed duplicate `defineProps` declaration in `DwstMapOverlay.vue`; removed and validated by green CI run `33100195482`.
- 2026-08-27: Corrected an earlier detection finding: `core/combat.ts` already invokes canonical `detectContacts(state)` during engagement resolution.
- 2026-08-27: Confirmed WW2-specific turn orchestration remained in `src/dwst/core/ww2.ts`; active demo caller migrated to generic `simulateTurn()` and validated by green CI run `33106939476`.
- 2026-08-27: Confirmed duplicate WW2 square-law implementations across core and scenario layers; consolidated into the selectable WW2 scenario layer and validated by green CI runs `33107940693` and `33107899018`.
- 2026-08-27: Confirmed standalone `src/dwst/core/battlefield.ts` was an independent x/y battlefield state implementation; deleted it without replacement.
- 2026-08-27: Direct inspection confirmed `CanonicalState` is resource/personnel/equipment authority only while `UnitState.position: WorldPosition` is canonical physical position.
- 2026-08-27: Direct inspection confirmed `simulationState.ts` and a compatibility detector still depended on deleted `BattlefieldState`; both obsolete paths were removed.
- 2026-08-27: CI failures exposed the remaining dependency tail after battlefield removal: resolver, logistics, scenario registry, and Ardennes scenario; all were migrated/removed without restoring battlefield state, and the final two runs of the cleanup sequence were green.
- 2026-08-27: Direct inspection confirmed the generic engine directly interpolates geographic longitude/latitude as Cartesian values; recorded as P2-S17 before correction.
- 2026-08-27: Direct inspection confirmed the host map/import-export architecture already provides GeoJSON geographic handling and ORBAT Mapper owns map conversion, so the engine correction must remain a small core geographic operation rather than a second map/projection system.

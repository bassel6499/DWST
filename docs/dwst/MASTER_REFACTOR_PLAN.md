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
- P2-S17 canonical geographic movement operations were added and CI validated.
- P2-S7 executable core spatial invariants were added and CI validated.
- The obsolete `src/dwst/core/ww2.ts` compatibility facade was removed after direct commit/diff inspection established that it contained only forwarding exports and the deprecated `runWW2Turn()` wrapper; its WW2 combat functionality was already owned by the selectable WW2 scenario layer and turn orchestration by the generic simulation pipeline. CI run `33117957851` passed type-check and unit tests after the subsequent WW2 fixture correction.

### Confirmed remaining architecture problems

#### P2-S1 — Two operational turn-resolution models

`resolveUnifiedTurn()` operated on `SimulationState`/legacy battlefield state and mutated it directly, while canonical `resolveTurn()` operates on `ScenarioState` and is documented as pure.

**Status:** Resolved and CI-validated.

#### P2-S2 — Duplicate spatial representations

Legacy `BattlefieldState` stored `Position { x, y }` while canonical `UnitState` stores geographic `WorldPosition { lon, lat }`.

**Status:** Resolved and CI-validated. Standalone battlefield implementation, legacy `SimulationState`, and retired x/y Ardennes scenario state have been removed/migrated.

#### P2-S3 — Duplicate detection implementations

`detection.ts` previously contained canonical `detectContacts(ScenarioState, ...)` and a compatibility `detect(BattlefieldState, ...)` using local `x/y` coordinates.

**Status:** Resolved and CI-validated. `detection.ts` exposes only canonical `detectContacts()` over `ScenarioState`/`WorldPosition`.

#### P2-S4 — No verified DWST conversion from legacy `x/y` to geographic position

The audit has not established a valid semantic mapping between legacy battlefield `x/y` and canonical `WorldPosition`. Therefore no implicit conversion may be invented.

**Status:** Confirmed constraint. The Ardennes migration deliberately does not fabricate a coordinate conversion.

#### P2-S5 — ORBAT Mapper owns map-coordinate conversion

Verified ORBAT Mapper evidence shows a `MapAdapter` contract with `toLonLat()` / `fromLonLat()` and related coordinate operations. This establishes an existing host map conversion boundary.

**Status:** Confirmed architectural integration point. DWST should not create a competing map projection.

#### P2-S6 — Legacy battlefield state remains live

`SimulationState` previously contained `BattlefieldState`, and the legacy resolver used it for movement and detection.

**Status:** Resolved and CI-validated. `core/battlefield.ts`, `core/simulationState.ts`, and the obsolete unified resolver have been removed.

#### P2-S7 — Map/simulation spatial consistency invariant needs executable protection

The architecture requires one authoritative geographic position. Executable invariant tests now validate canonical unit position validity, scenario/unit identity consistency, and order destinations as separate future intent rather than a second current location.

**Status:** Resolved and CI-validated.

#### P2-S8 — WW2 orchestration resides in `core`

Direct inspection of the deletion commit confirmed `src/dwst/core/ww2.ts` was only a compatibility facade. It re-exported selectable WW2 combat and wrapped generic `simulateTurn(state)` as deprecated `runWW2Turn()`.

The facade was removed in commit `3efec7b3e363ab12468a31d81c697ef153792b33`. The replacement architecture is already in the selectable WW2 scenario layer plus the era-neutral generic simulation pipeline. The subsequent WW2 fixture correction was validated by green CI run `33117957851`.

**Status:** Resolved and CI-validated. The compatibility facade is deleted; no replacement facade is required.

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

**Status:** Resolved and CI-validated. `src/dwst/core/simulationState.ts` deleted.

#### P2-S15 — WW2 Ardennes scenario embedded the deleted x/y battlefield model

The scenario embedded an x/y battlefield and retired operational state. No verified conversion to `WorldPosition` existed.

**Status:** Resolved without fabrication. Scenario now constructs canonical `ScenarioState`; authoritative geography must enter through scenario/ORBAT inputs.

#### P2-S16 — Logistics retained a hidden dependency on the deleted battlefield module

`SupplyRoute` was imported from `./battlefield` even though supply resolution did not require battlefield state.

**Status:** Resolved and CI-validated. Logistics now owns a minimal local `SupplyRoute` contract.

#### P2-S17 — Generic engine treats geographic longitude/latitude as Cartesian coordinates

The generic engine previously computed movement with direct lon/lat `dx`, `dy`, `Math.hypot`, and linear interpolation.

**Resolution:** `geographicDistanceMeters()` and `interpolateGeographicPosition()` now provide deterministic geographic/great-circle operations over canonical `WorldPosition`; engine movement uses those operations.

Focused tests cover boundary fractions, clamping, intermediate geographic validity, antimeridian behavior, zero distance, and geographic distance sanity.

**Status:** Resolved and CI-validated.

### Next investigation / implementation order

1. Determine whether the generic engine needs a ruleset-owned detection policy/interface so detection behavior remains era-configurable.
2. Identify and formalize the smallest ORBAT Mapper import/export boundary for scenario/unit geographic data; reuse existing GeoJSON/map contracts rather than adding a projection.
3. Run a final whole-project audit for duplicate state authority, coordinate systems, era leakage, mutation boundaries, and hidden legacy consumers.

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
- 2026-08-27: Direct inspection confirmed the generic engine directly interpolated geographic longitude/latitude as Cartesian values; corrected through deterministic great-circle movement operations and focused tests; CI validated.
- 2026-08-27: Direct inspection confirmed the host map/import-export architecture already provides GeoJSON geographic handling and ORBAT Mapper owns map conversion, so the engine correction remains a small core geographic operation rather than a second map/projection system.
- 2026-08-27: Executable core spatial invariants were added and CI validated, protecting one authoritative current physical position.
- 2026-08-27: Direct inspection confirmed `core/ww2.ts` was only a compatibility facade; commit `3efec7b3e363ab12468a31d81c697ef153792b33` removed it after the active caller had already migrated. Subsequent CI run `33117957851` passed type-check and unit tests after the WW2 fixture correction. P2-S8 is now closed.

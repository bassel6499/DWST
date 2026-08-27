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

## Phase 2 — Canonical state / spatial consolidation

### Completed / verified

- Canonical `UnitState` uses `WorldPosition` (`lon`, `lat`).
- Canonical `ScenarioState` and `resolveTurn()` / `applyTurn()` establish a pure-resolution plus explicit-application boundary.
- Canonical resource state remains an aggregate/resource authority and does not replace the individual personnel registry.
- Redundant simulation-step cloning was removed and CI subsequently passed.
- The map-facing DWST path consumes canonical scenario state and geographic positions.
- `DwstMapOverlay.vue` duplicate `defineProps` declaration was removed; CI run `33100195482` passed type-check and unit tests.
- Direct inspection of `DwstDemoView.vue` confirms the current visible DWST demo advances the canonical `ScenarioState` through `runWW2Turn()`, not `resolveUnifiedTurn()`.

### Confirmed remaining architecture problems

#### P2-S1 — Two operational turn-resolution models

`resolveUnifiedTurn()` operates on `SimulationState`/legacy battlefield state and mutates it directly, while canonical `resolveTurn()` operates on `ScenarioState` and is documented as pure. These are materially different execution models.

**Status:** Confirmed. Direct inspection of the current DWST demo shows `runWW2Turn()` is the active visible turn entry point. This does not yet prove `resolveUnifiedTurn()` has zero non-UI consumers, so it remains compatibility code until repository-wide caller evidence is established.

#### P2-S2 — Duplicate spatial representations

Legacy `BattlefieldState` stores `Position { x, y }` and movement/detection operate on those coordinates. Canonical `UnitState` stores geographic `WorldPosition { lon, lat }`.

**Status:** Confirmed. The two representations must not remain independent long-term.

#### P2-S3 — Duplicate detection implementations

`detection.ts` contains canonical `detectContacts(ScenarioState, ...)` using `WorldPosition` and a compatibility `detect(BattlefieldState, ...)` using local `x/y` coordinates.

**Status:** Confirmed. The legacy detector must be retired only after its consumers and required behavior are migrated.

#### P2-S4 — No verified DWST conversion from legacy `x/y` to geographic position

The audit has not established a valid semantic mapping between legacy battlefield `x/y` and canonical `WorldPosition`. Therefore no implicit conversion may be invented.

**Status:** Confirmed constraint.

#### P2-S5 — ORBAT Mapper owns map-coordinate conversion

Verified ORBAT Mapper evidence shows a `MapAdapter` contract with `toLonLat()` / `fromLonLat()` and related coordinate operations. This establishes an existing host map conversion boundary.

**Status:** Confirmed architectural integration point. DWST should not create a competing map projection.

#### P2-S6 — Legacy battlefield state remains live

`SimulationState` still contains `BattlefieldState`, and the legacy resolver uses it for movement and detection. Previous removal attempts caused concrete CI failures from remaining consumers.

**Status:** Confirmed. Retain temporarily; migrate consumers first.

#### P2-S7 — Map/simulation spatial consistency invariant needs executable protection

The architecture requires one authoritative geographic position. A future invariant test should prove that any displayed/derived map position is derived from the same canonical `WorldPosition` and cannot silently diverge into a second physical location.

**Status:** Confirmed requirement; map serialization is directly observed to copy `[lon, lat]` from `UnitState.position`; executable test coverage is now the next safe step.

### Next investigation / implementation order

1. Prove all callers/entry points of `resolveUnifiedTurn()` using direct repository evidence; do not trust false-negative code-search results.
2. Prove all callers of legacy `detect()` and `moveUnit()`.
3. Determine whether those callers can consume canonical `ScenarioState`/`WorldPosition` without losing required behavior.
4. Identify the exact ORBAT Mapper integration boundary used by the application for geographic/map conversion.
5. If a verified bridge exists, reuse it. If not, define the smallest explicit interface needed; do not implement an independent projection.
6. Add executable tests protecting the canonical `WorldPosition` → map GeoJSON invariant.
7. Migrate detection to canonical `WorldPosition`.
8. Migrate movement to canonical `WorldPosition`, preserving observed movement behavior through explicit rules/terrain inputs.
9. Migrate terrain/logistics dependencies that currently require `BattlefieldState`.
10. Remove the legacy `detect()` and `moveUnit()` implementations only after zero required consumers are proven.
11. Remove `BattlefieldState` from operational state only after migration tests and CI establish that canonical state is sufficient.
12. Run a final whole-project audit for duplicate state authority, coordinate systems, mutation boundaries, and hidden legacy consumers.

## Findings log

- 2026-08-27: Direct inspection confirmed the canonical map path uses geographic `WorldPosition`.
- 2026-08-27: Direct inspection confirmed legacy battlefield movement/detection use `x/y`.
- 2026-08-27: Direct inspection confirmed canonical `resolveTurn()` and legacy `resolveUnifiedTurn()` have different state/mutation contracts.
- 2026-08-27: Direct inspection confirmed the current visible DWST demo advances `ScenarioState` with `runWW2Turn()`.
- 2026-08-27: Verified mature ORBAT Mapper `MapAdapter` exposes geographic/map coordinate conversion; this is the host map boundary to reuse.
- 2026-08-27: Confirmed DWST currently has no verified semantic conversion from legacy battlefield `x/y` to `WorldPosition`; no such conversion is to be invented.
- 2026-08-27: Confirmed duplicate `defineProps` declaration in `DwstMapOverlay.vue`; removed and validated by green CI run `33100195482`.
- 2026-08-27: Direct inspection confirmed `scenarioToGeoJSON()` serializes each canonical `UnitState.position` directly as `[lon, lat]`; no second spatial coordinate is introduced in that map serialization layer.

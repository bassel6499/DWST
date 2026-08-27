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

### Confirmed remaining architecture problems

#### P2-S1 — Two operational turn-resolution models

`resolveUnifiedTurn()` operates on `SimulationState`/legacy battlefield state and mutates it directly, while canonical `resolveTurn()` operates on `ScenarioState` and is documented as pure. These are materially different execution models.

**Status:** Confirmed. Migration required, but callers must be established before changing/removing the legacy contract.

#### P2-S2 — Duplicate spatial representations

Legacy `BattlefieldState` stores `Position { x, y }` and movement/detection operate on those coordinates. Canonical `UnitState` stores geographic `WorldPosition { lon, lat }`.

**Status:** Confirmed. The standalone legacy battlefield implementation in `core/battlefield.ts` has been proven to have zero current repository-search consumers for `BattlefieldState`, `moveUnit`, and `terrainAt`. The module is safe to remove. Remaining P2-S2 work concerns any other hidden/renamed spatial representation, which must be checked through direct source inspection.

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

**Status:** Confirmed historically. The standalone `core/battlefield.ts` implementation has now been proven to have zero current consumers and is being removed. Any remaining `BattlefieldState` references must be treated separately and verified directly.

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

**Status:** Migration in progress. The canonical WW2 square-law implementation has been moved into `scenarios/ww2/combat.ts`, and the generic era registry is being bound to that scenario-owned implementation. The old `core/ww2SquareLaw.ts` has been removed. CI must validate the consolidation before any further cleanup.

#### P2-S12 — Standalone legacy battlefield module has zero current consumers

Direct repository evidence found `src/dwst/core/battlefield.ts` contains a complete parallel `BattlefieldState`/`Position {x,y}` model plus `terrainAt()` and `moveUnit()`. Repository searches for `BattlefieldState`, `moveUnit`, `terrainAt`, `position.x`, and `resolveUnifiedTurn` returned no current consumers for this standalone module. This is distinct from any remaining legacy state embedded elsewhere.

**Status:** Confirmed safe deletion. Remove `src/dwst/core/battlefield.ts`; do not replace it with another map/battlefield module. Preserve needed terrain/movement behavior only through canonical state/environment inputs and existing generic/era-neutral mechanisms.

### Next investigation / implementation order

1. Prove all callers/entry points of `resolveUnifiedTurn()` using direct repository evidence; do not trust false-negative code-search results.
2. Prove all callers of legacy `detect()` and `moveUnit()`.
3. Preserve/expand tests around observed WW2 movement, combat, sustainment, time, and detection behavior before removing the WW2 compatibility shim.
4. Determine whether the generic engine needs a ruleset-owned detection policy/interface so detection behavior remains era-configurable rather than WW2-specific.
5. Identify the exact ORBAT Mapper integration boundary used by the application for geographic/map conversion.
6. If a verified bridge exists, reuse it. If not, define the smallest explicit interface needed; do not implement an independent projection.
7. Migrate detection consumers to canonical `WorldPosition`.
8. Migrate movement consumers to canonical `WorldPosition`, preserving observed movement behavior through explicit rules/terrain inputs.
9. Migrate terrain/logistics dependencies that currently require `BattlefieldState`.
10. Remove the legacy `detect()` and `moveUnit()` implementations only after zero required consumers are proven.
11. Remove `BattlefieldState` from operational state only after migration tests and CI establish that canonical state is sufficient.
12. Remove `core/ww2.ts` only after its active/required callers are migrated and WW2 behavior is covered by the selectable WW2 ruleset.
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
- 2026-08-27: Confirmed duplicate WW2 square-law implementations across core and scenario layers; consolidated the active implementation into the selectable WW2 scenario layer and removed the duplicate core module. Awaiting CI validation.
- 2026-08-27: Confirmed standalone `src/dwst/core/battlefield.ts` is an independent x/y battlefield state implementation with no current repository-search consumers for its public state/helpers; safe deletion is authorized by the direct-evidence rule.

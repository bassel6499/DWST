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

### Confirmed remaining architecture problems

#### P2-S1 — Two operational turn-resolution models

`resolveUnifiedTurn()` operates on `SimulationState`/legacy battlefield state and mutates it directly, while canonical `resolveTurn()` operates on `ScenarioState` and is documented as pure. These are materially different execution models.

**Status:** Confirmed. Migration required, but callers must be established before changing/removing the legacy contract.

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

Verified mature ORBAT Mapper evidence shows a `MapAdapter` contract with `toLonLat()` / `fromLonLat()` and related coordinate operations. This establishes an existing host map conversion boundary.

**Status:** Confirmed architectural integration point. DWST should not create a competing map projection.

#### P2-S6 — Legacy battlefield state remains live

`SimulationState` still contains `BattlefieldState`, and the legacy resolver uses it for movement and detection. Previous removal attempts caused concrete CI failures from remaining consumers.

**Status:** Confirmed. Retain temporarily; migrate consumers first.

#### P2-S7 — Map/simulation spatial consistency invariant needs executable protection

The architecture requires one authoritative geographic position. A future invariant test should prove that any displayed/derived map position is derived from the same canonical `WorldPosition` and cannot silently diverge into a second physical location.

**Status:** Confirmed requirement; test design pending direct evidence of the host integration boundary.

#### P2-S8 — WW2 orchestration resides in `core`

Direct inspection confirmed `src/dwst/core/ww2.ts` contains WW2-specific combat and turn orchestration (`resolveWW2Combat`, `runWW2Turn`). The generic engine/ruleset architecture already defines `EraRuleset` and a selectable WW2 ruleset. Keeping a WW2 turn orchestrator inside `core` risks making WW2 behavior part of the core execution architecture.

**Status:** Confirmed boundary violation. Do not simply move/delete the file; first migrate its active callers to the generic `simulateTurn()` / `resolveTurn()` path and preserve observed WW2 behavior through the WW2 ruleset.

#### P2-S9 — Canonical combat already owns canonical detection indirectly

A previous audit hypothesis treated detection as absent from the canonical WW2 path. Direct inspection corrected that: `resolveEngagements()` calls canonical `detectContacts(state)` before invoking the selected era's `resolveCombat`. Therefore the remaining problem is not the absence of canonical detection mechanics; it is ensuring the canonical turn architecture exposes and composes detection correctly without reviving the legacy `BattlefieldState` detector.

**Status:** Corrected finding. Do not create a second canonical detection engine or falsely classify detection as missing.

### Next investigation / implementation order

1. Prove all callers/entry points of `resolveUnifiedTurn()` using direct repository evidence; do not trust false-negative code-search results.
2. Prove all callers of legacy `detect()` and `moveUnit()`.
3. Prove the active application's WW2 entry point and migrate it from `runWW2Turn()` to the generic `simulateTurn()` / `resolveTurn()` path without changing the WW2 ruleset's identity.
4. Preserve/expand tests around observed WW2 movement, combat, sustainment, time, and detection behavior before removing the WW2 orchestrator.
5. Determine whether the generic engine needs a ruleset-owned detection policy/interface so detection behavior remains era-configurable rather than WW2-specific.
6. Identify the exact ORBAT Mapper integration boundary used by the application for geographic/map conversion.
7. If a verified bridge exists, reuse it. If not, define the smallest explicit interface needed; do not implement an independent projection.
8. Migrate detection consumers to canonical `WorldPosition`.
9. Migrate movement consumers to canonical `WorldPosition`, preserving observed movement behavior through explicit rules/terrain inputs.
10. Migrate terrain/logistics dependencies that currently require `BattlefieldState`.
11. Remove the legacy `detect()` and `moveUnit()` implementations only after zero required consumers are proven.
12. Remove `BattlefieldState` from operational state only after migration tests and CI establish that canonical state is sufficient.
13. Remove `core/ww2.ts` only after its active callers are migrated and WW2 behavior is covered by the selectable WW2 ruleset.
14. Run a final whole-project audit for duplicate state authority, coordinate systems, era leakage, mutation boundaries, and hidden legacy consumers.

## Findings log

- 2026-08-27: Direct inspection confirmed the canonical map path uses geographic `WorldPosition`.
- 2026-08-27: Direct inspection confirmed legacy battlefield movement/detection use `x/y`.
- 2026-08-27: Direct inspection confirmed canonical `resolveTurn()` and legacy `resolveUnifiedTurn()` have different state/mutation contracts.
- 2026-08-27: Verified mature ORBAT Mapper `MapAdapter` exposes geographic/map coordinate conversion; this is the host map boundary to reuse.
- 2026-08-27: Confirmed DWST currently has no verified semantic conversion from legacy battlefield `x/y` to `WorldPosition`; no such conversion is to be invented.
- 2026-08-27: Confirmed duplicate `defineProps` declaration in `DwstMapOverlay.vue`; removed and validated by green CI run `33100195482`.
- 2026-08-27: Corrected an earlier detection finding: `core/combat.ts` already invokes canonical `detectContacts(state)` during engagement resolution. Detection mechanics therefore exist canonically; the integration/era-neutral composition remains the task.
- 2026-08-27: Confirmed WW2-specific turn orchestration remains in `src/dwst/core/ww2.ts`; this is a core/era boundary violation that must be resolved without making WW2 the core mechanic.

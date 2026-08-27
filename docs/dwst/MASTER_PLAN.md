# DWST Master Refactor Plan

Branch: `audit/canonical-state-refactor`

This is an audit/refactor branch. Do not merge into `main` until all required gates have explicit implementation and passing CI evidence.

## Governing rule: no speculation
- [x] No architectural adjustment, deletion, ruling, or design decision based only on assumptions.
- [x] Every such decision must be supported by direct repository observation, test evidence, or documented research.
- [ ] If tooling/search is unreliable, use a different evidence path rather than treating missing results as proof of absence.

## Phase 1 — canonical foundations
- [x] Establish canonical `ScenarioState` / `UnitState` surface.
- [x] Establish geographic `WorldPosition` on canonical units.
- [x] Establish canonical resource/accounting direction.
- [x] Align era vocabulary and ruleset vocabulary.
- [x] Preserve personnel/crew/equipment separation.

## Phase 2 — canonical state-transition architecture
- [x] Establish pure canonical `resolveTurn()` behavior.
- [x] Establish explicit `applyTurn()` commit boundary.
- [x] Add regression coverage proving input state is not mutated.
- [x] Remove redundant cloning at the simulation-step boundary.
- [x] Verify canonical `simulateTurn()` path with CI.
- [x] Audit competing turn/state paths.
- [x] Discover that `BattlefieldState` has live consumers; restore it rather than deleting it prematurely.
- [ ] Migrate live `BattlefieldState` consumers without changing simulation meaning.
- [ ] Establish one authoritative spatial identity across simulation-facing subsystems.
- [ ] Resolve the duplicate detection implementations (`detectContacts` geographic vs `detect` battlefield-local).
- [ ] Decide the authoritative detection phase/order from observed callers and existing behavior.
- [ ] Resolve the provisional `simulationState.ts` + `resolveTurn.ts` integration prototype so it cannot become a competing authoritative state model.
- [ ] Audit and reconcile the legacy `turnEngine.ts` path before any final deletion decision.
- [ ] Only delete legacy battlefield/turn files after zero live consumers and zero unique required responsibilities are proven.

## Phase 3 — canonical accounting
- [ ] Reconcile scalar `UnitState.equipment` with detailed `EquipmentPool` accounting.
- [ ] Establish exactly one equipment-loss accounting path.
- [ ] Establish canonical crew accounting and training pipeline.
- [ ] Verify personnel casualties cannot implicitly create qualified crews.
- [ ] Add accounting regression fixtures.

## Phase 4 — versioned model/rules contract
- [ ] Define inspectable formula/parameter contract.
- [ ] Define deterministic RNG/state handling where randomness is required.
- [ ] Ensure era/scenario data cannot mutate core formulas by side effect.
- [ ] Validate model parameters independently from attractive/expected outcomes.
- [ ] Add model regression fixtures.

## Phase 5 — pure combat and sustainment
- [ ] Make combat resolution pure: snapshot -> result/delta.
- [ ] Remove direct authoritative-state mutation from combat.
- [ ] Make sustainment pure and explicit about resource deltas.
- [ ] Verify fatigue, wear, readiness, ammunition, fuel, logistics and losses have auditable accounting paths.

## Phase 6 — deterministic replay and historical validation
- [ ] Add deterministic replay/AAR regression tests.
- [ ] Ensure saved initial state + ordered command log reproduces results.
- [ ] Keep historical claims/data separate from engine mathematics and record provenance.
- [ ] Validate Ardennes/WWII scenario data only after kernel fixtures pass.

## Phase 7 — ORBAT Mapper / map integration
- [ ] Reuse existing ORBAT Mapper spatial infrastructure where it is genuinely compatible.
- [ ] Keep map rendering/import/export as adapters, never simulation sources of truth.
- [ ] Ensure map position, simulation position, terrain and elevation derive from the same authoritative geographic identity.
- [ ] Add explicit geometry/CRS adapters where conversion is unavoidable.
- [ ] Prove land/water/terrain consistency so a simulation position cannot silently disagree with the map.

## Known architectural issues discovered during audit
1. Two top-level state models coexist (`ScenarioState` and provisional `SimulationState`).
2. Two spatial representations coexist (geographic `WorldPosition` and local battlefield `{x,y}`).
3. Two detection implementations coexist.
4. `engine.ts` currently resolves movement/degradation/assessment/combat but does not itself execute a detection phase.
5. `resolveTurn.ts` directly mutates the provisional `SimulationState` and battlefield state.
6. `BattlefieldState` remains a live dependency and therefore is not currently safe to delete.
7. Legacy `turnEngine.ts` requires a final caller/functionality audit before deletion.
8. `simulationStep.ts` has had redundant cloning removed on the canonical path; this invariant is covered by the refactor work.

## Deletion policy
A file may be deleted only when all are proven:
- no live imports/callers remain;
- no unique required functionality remains;
- replacement behavior is covered by tests;
- CI is green after deletion;
- deletion does not violate DWST's deterministic, era-agnostic, auditable architecture.

## Current checkpoint
The latest branch tip before this plan update is `ba5139269a5ec6db0c5adebfa96dd58a52eada36` and the recent CI checkpoints reported by the user are green. This plan update itself must also pass CI before further refactoring continues.

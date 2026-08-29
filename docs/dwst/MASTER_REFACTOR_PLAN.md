# DWST Master Refactor Plan

> Authoritative roadmap and current refactor state for `audit/canonical-state-refactor`.
>
> This document is documentation only. It is not imported, executed, or required by DWST runtime/project code.

## Plan authority and synchronization rules

1. This file is the single authoritative current roadmap/state document under `docs/dwst/`.
2. The roadmap must preserve the original roadmap phases, milestones, rationale, and completed history. New findings are appended to the appropriate phase; they do not replace older records.
3. Never create a competing plan, ledger, sidecar roadmap, or alternate current-state file.
4. Before making claims about repository state, inspect the current branch and relevant source files directly. Search/index results are discovery aids only and are never proof of absence or current state.
5. Before a plan update, retrieve the current file/blob and use its exact current SHA for the write. Never reconstruct a truncated plan from memory.
6. After every implementation, CI result, audit finding, or architectural decision, update this document before advancing to unrelated work.
7. Record CI as `running`, `red`, `green`, or `user-confirmed green`; never infer green from a commit or from a later run.
8. If a plan write cannot be safely completed, stop advancement rather than create another authority or silently proceed.
9. Plan documents are documentation only and must not be imported by, bundled into, or otherwise directly affect project runtime code.
10. A new chat must be able to recover project state from this file plus the repository itself; conversational memory is not a required source of truth.
11. Phase 2 is tracked as three implementation stages. Closing a stage does not close the phase until the remaining stage backlog and merge gates are satisfied.
12. Historical findings from older roadmap/audit documents must be promoted into the active backlog when they remain unresolved; they must not disappear merely because a newer milestone was completed.
13. Every active bug/backlog item must have an explicit status and remain visible until directly verified closed.

## Original roadmap preservation

The original refactor roadmap remains the implementation backbone. Historical phase intent and completed work must remain represented when current-state restructuring is performed. Architectural discoveries found through the Audit Map and older refactor-gate documents are recorded against the appropriate master-plan phase before implementation.

The older architecture audit established the following refactor sequence and these remain binding design constraints:
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

## Architectural boundary rules

- WW2 is a selectable scenario/ruleset, never a generic core mechanic.
- ORBAT Mapper is the external map-display/projection system; DWST supplies canonical simulation state and geographic positions.
- The application `scenariostore` geographic model is separate from DWST scenario data. Do not introduce an implicit dependency merely to resolve DWST objectives.
- The Architectural Blueprint/Audit Map is a discovery/debugging map, not an implementation roadmap.
- CI is a validation gate, not architectural proof.
- Canonical simulation state owns authoritative records; projections/read models must not silently become authorities.

## Phase 2 — Canonical State / Architecture Refactor

### Stage 1 — Canonical state foundations

### P2-S18 — Detection geographic-distance refactor
**Status: CLOSED / CI GREEN**

Detection uses the canonical geographic-distance path rather than a duplicate distance implementation.

### P2-S20 — WW2-specific core leakage audit
**Status: CLOSED / CI GREEN**

Unused WW2-specific core engagement/combat-arms implementations were removed. The surviving WW2 compatibility surface was audited rather than treating WW2 as generic core behavior.

### P2-S21 — legacy geographic-distance audit
**Status: CLOSED**

The canonical spatial path is `geographicDistanceMeters()` / geographic movement. Legacy duplicate distance paths were removed or retired where verified.

### Stage 2 — Scenario/state integration

### P2-S23 — scenario geographic objectives / locations
**Status: CLOSED / CI GREEN (user-confirmed)**

Implemented a generic DWST scenario-location contract and resolver. Named scenario objectives resolve to canonical `WorldPosition` values and feed `Order.destination` without coupling DWST to the application `scenariostore` or ORBAT Mapper.

Implementation included the Ardennes Bastogne location, live order-path integration, preservation through simulation-session cloning, and focused/end-to-end tests.

Validation history:
- CI `33255461370`: RED — initial integration test had a TypeScript optional-location error.
- Corrective test commit: `77c37f93592d23a35c629e9aac61362a76b68c30`.
- CI `33255660136`: RED — integration assertion incorrectly assumed latitude must increase.
- Corrective commit: `a4df75f97256a17d057de84670660638e5ec9f7b`; assertion changed to the canonical decreasing-distance invariant.
- Subsequent CIs: USER-CONFIRMED GREEN.

### P2-S33 — Ardennes scenario authority / duplicate scenario definitions
**Status: CLOSED / CI GREEN (user-confirmed)**

Audited the scenario architecture and established that DWST's Ardennes scenario is separate from the application's general `scenariostore`/map system. Duplicate Ardennes scenario definitions were removed after direct source inspection; the populated `src/dwst/scenarios/ardennes1944.ts` remains the surviving scenario fixture.

Deletion commits:
- `b58eb2bc9f0d79df440a4d3299b2de7d8d1404b4`
- `5453ec4ae2632fccd9bf16377ee0e50d483ace6c`

Both deletion CIs were user-confirmed green.

Permanent constraint: do not merge the application scenario-store geography into DWST merely to provide objective resolution.

### Stage 3 — Canonical accounting, deterministic resolution, and production gates

### P2-S27 — canonical personnel/equipment commit bridge
**Status: ACTIVE — S27-A IMPLEMENTED; S27-B/C/D REMAIN**

`CanonicalState` is the authoritative resource state containing personnel, equipment, crew assignments, and equipment definitions. The projection layer treats these records as authoritative while `UnitState` is a derived aggregate. The live `SimulationSession` currently carries `ScenarioState`, baseline, and rules but not `CanonicalState`.

Combat resolution currently produces aggregate loss information and the application path mutates `UnitState.personnel` / `UnitState.equipment`; the missing bridge is a deterministic authoritative-state commit. Combat does not currently identify which authoritative personnel/equipment records are lost, so the implementation must not arbitrarily destroy the first N records.

#### S27-A — explicit canonical combat commit contract
**Status: IMPLEMENTED / CI PENDING**

Added `src/dwst/core/canonicalCombatCommit.ts`. The contract accepts explicit personnel IDs and equipment instance IDs with explicit dispositions and applies those changes immutably to `CanonicalState`. It rejects duplicate and unknown record allocations. No casualty identity or disposition is invented by the commit layer.

Commit: `dc897ab290ec863cd6d8b424aedca05072ce7a47`.

Focused tests were added in `src/dwst/core/canonicalCombatCommit.test.ts`, covering explicit allocation, immutability, duplicate IDs, and unknown IDs.

Test commit: `efce9936d4bbf816ad38fc863db201728a8b5e93`.

#### S27-B — deterministic casualty/resource allocation
**Status: ACTIVE**

Define how an aggregate combat result becomes an explicit canonical allocation without embedding WW2-specific casualty assumptions in the generic bridge. The allocation policy must be deterministic and inspectable.

#### S27-C — canonical-to-unit projection reconciliation
**Status: ACTIVE**

After canonical commit, affected unit aggregates must be regenerated/reconciled from authoritative records and verified against accounting invariants. Compatibility aggregates must not become a second authority.

#### S27-D — live-turn integration and replay regression
**Status: ACTIVE**

Carry canonical resource state through the live simulation turn boundary, commit authoritative changes there, and add deterministic/replay/accounting regression coverage.

### Remaining Phase-2 backlog promoted from the older architecture audit / refactor gates

These items remain active unless directly verified closed. They are deliberately tracked separately from S27 so later work cannot make them disappear:

#### P2-B01 — Aggregate-vs-detailed equipment/personnel reconciliation
**Status: ACTIVE**

`UnitState` aggregate personnel/equipment fields must be reconciled with the detailed authoritative ledgers/records. Compatibility fields must not become a second accounting authority.

#### P2-B02 — Duplicate crew training/reinforcement pipeline
**Status: ACTIVE**

Older refactor gates identify duplicate crew training/reinforcement implementations. Establish one authoritative pipeline and verify specialist qualification rules remain explicit and deterministic.

#### P2-B03 — Direct combat state mutation removal
**Status: ACTIVE / coupled to S27**

Combat resolution must remain a pure snapshot-to-delta operation. All authoritative state mutation must occur through the turn/state-application commit boundary.

#### P2-B04 — Deterministic RNG/state handling
**Status: ACTIVE**

Define and enforce canonical deterministic RNG/state handling so identical state + orders + ruleset + seed produce identical results.

#### P2-B05 — Accounting and replay regression suite
**Status: ACTIVE**

Add regression tests covering personnel/equipment accounting, authoritative-state transitions, deterministic replay, and reproducibility from saved initial state plus ordered command log.

#### P2-B06 — Independent mathematical combat-model validation
**Status: ACTIVE**

Validate combat mathematics independently before coupling further historical scenario/UI behavior. Coefficients must remain inspectable and must not be tuned solely to create attractive outcomes.

#### P2-B07 — Sustainment/resource-delta purity audit
**Status: ACTIVE**

The older architecture sequence requires sustainment to be pure and explicit about resource deltas. Verify the current implementation has one authoritative commit path and no hidden mutation.

#### P2-B08 — One authoritative turn-state commit boundary
**Status: ACTIVE**

The turn engine/state application layer must be the only component allowed to commit simulation state changes. Audit remaining direct mutation paths after S27.

#### P2-B09 — Deterministic regression fixtures before historical validation
**Status: ACTIVE**

Build/verify deterministic kernel fixtures before expanding historical scenario validation. Historical scenario content must not be used to hide kernel instability.

#### P2-B10 — Historical provenance/model-assumption separation
**Status: ACTIVE**

Historical claims require provenance and must remain distinguishable from model assumptions. The engine must not invent OOB data.

#### P2-B11 — Final ORBAT Mapper adapter boundary audit
**Status: ACTIVE / later-stage gate**

ORBAT Mapper remains presentation/import/export only. Verify that future map integration cannot modify simulation mathematics or become a source of combat truth.

## Phase-2 completion gates

Phase 2 is **NOT COMPLETE** merely because S27 is closed. Before Phase 2 can be declared complete, all active backlog items above must either be implemented and tested or explicitly reclassified with a documented reason, and the following gates must pass:

- one authoritative simulation state;
- separate authoritative personnel, crew, and equipment accounting;
- no implicit personnel/equipment replacement;
- no direct authoritative mutation inside combat resolution;
- exactly one equipment-loss accounting path per resolution;
- deterministic state + orders + ruleset + seed behavior;
- reproducible AAR/replay from initial state + ordered command log;
- independently validated combat mathematics;
- explicit sustainment/resource deltas;
- historical provenance/model assumptions distinguishable;
- ORBAT Mapper remains an adapter/presentation layer.

## Current execution position

**Phase 2: IN PROGRESS.**

Current stage: **Stage 3 — Canonical accounting, deterministic resolution, and production gates.**

Completed tracked milestones: S18, S20, S21, S23, S33.

Active implementation: **P2-S27-B**, following implementation of S27-A.

Additional active backlog: **P2-B01 through P2-B11**, promoted from the older architecture audit/refactor-gate requirements so they remain visible and cannot be accidentally lost during S27 work.

The phase therefore has substantial work remaining even though the original six milestone items have mostly been completed. S27 remains the current critical-path item; the promoted backlog will be audited/closed in dependency order rather than treated as optional cleanup.

## Historical / audit record

The Architectural Blueprint/Audit Map and older architecture/refactor-gate documents remain discovery and historical artifacts. Their unresolved requirements have been promoted into this master plan rather than discarded. Findings discovered through those audits must be incorporated into the appropriate phase/item before implementation.

## Latest S27 execution record

- S27-A implementation commit: `dc897ab290ec863cd6d8b424aedca05072ce7a47`.
- S27-A focused-test commit: `efce9936d4bbf816ad38fc863db201728a8b5e93`.
- S27-A uses explicit canonical record IDs and dispositions; it does not invent casualty allocation.
- The focused test suite must pass CI before S27-A is marked validated.

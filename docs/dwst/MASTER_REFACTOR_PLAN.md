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

### Additional independent audit findings — deferred until current critical-path work is complete

These findings were discovered by direct inspection of the current repository after the existing Phase-2 plan was established. They are deliberately **deferred** rather than allowed to interrupt S27 and the already-active Phase-2 dependency chain. They must remain visible and be addressed after the current critical-path work, before Phase 2 can be declared complete.

#### P2-B12 — Combat-power authority audit
**Status: ACTIVE / DEFERRED**

Determine whether `UnitState.combatPower` is authoritative, derived, or obsolete. The current Ardennes fixture initializes `combatPower` to zero while the engine also derives an effective combat-power value, and the WW2 combat resolver uses a separate effectiveness calculation. Eliminate competing or dead combat-effectiveness paths and establish one authoritative semantic.

#### P2-B13 — Sensor-to-engagement integration
**Status: ACTIVE / DEFERRED**

The detection system supports sensors, but the current engagement-resolution path supplies an empty sensor list. Establish the intended sensor-to-detection-to-engagement pipeline and verify actual sensor capabilities affect detection when they are supposed to.

#### P2-B14 — Resource-gated movement
**Status: ACTIVE / DEFERRED**

Fuel currently drains with movement but does not meaningfully prevent or constrain movement when depleted. Define and test fuel-gated movement, including the intended behavior for zero/insufficient fuel and resupply/recovery.

#### P2-B15 — Ammunition expenditure and replenishment
**Status: ACTIVE / DEFERRED**

Ammunition currently modifies combat effectiveness but is not consumed by combat in the same authoritative resource path. Define explicit ammunition deltas and authoritative replenishment/sustainment behavior.

#### P2-B16 — Multi-engagement resolution semantics
**Status: ACTIVE / DEFERRED**

Define whether engagements within a turn are simultaneous, sequential, phased, or initiative-based. Prevent stale pre-combat strength from causing incorrect repeated exposure or order-dependent outcomes when units participate in multiple engagements.

#### P2-B17 — Combat numerical stability and extreme-case validation
**Status: ACTIVE / DEFERRED**

Stress-test the WW2 square-law/RK4 implementation across zero/near-zero and highly asymmetric force ratios, extreme modifiers, repeated turns, and large values. Establish explicit invariants for finite, non-negative, bounded results and expected limiting behavior.

#### P2-B18 — Physical movement model audit
**Status: ACTIVE / DEFERRED**

The current geographic movement model advances units by a fraction of remaining distance rather than an explicit physical movement capability. Define the required movement semantics, including unit movement capability and appropriate terrain/road/formation/logistics effects, before treating operational movement as complete.

#### P2-B19 — Order normalization boundary
**Status: ACTIVE / DEFERRED**

Ensure named objectives are resolved into canonical destinations before an order reaches turn resolution, or otherwise make the contract explicit and enforce it. Avoid partially specified orders silently becoming no-ops.

#### P2-B20 — Spatial environment model
**Status: ACTIVE / DEFERRED**

Assess whether terrain and weather need geographic/area-specific representation rather than only scenario-wide scalar values. Preserve the current geographic-state architecture while preventing environmental effects from becoming unrealistically global.

#### P2-B21 — Detection probability semantics
**Status: ACTIVE / DEFERRED**

The current detection implementation produces a value named `probability` but uses it as a threshold rather than performing a probability draw. Decide whether the value is a deterministic detection/confidence score or a seeded probability and align naming, semantics, tests, and RNG policy accordingly.

#### P2-B22 — Combined-arms input integration
**Status: ACTIVE / DEFERRED**

The WW2 combat contract accepts artillery, armor, anti-armor, air, maneuver, and command effects, but the current generic WW2 integration supplies zero for these support inputs. Connect real capabilities/effects when the historical model requires them and keep those effects era-owned.

#### P2-B23 — Equipment-loss model audit
**Status: ACTIVE / DEFERRED**

The current WW2 combat model derives equipment losses from a fixed personnel-loss ratio. Replace or explicitly validate this placeholder against the canonical equipment-instance model so equipment losses are not double-accounted or detached from equipment type, status, and combat effects.

#### P2-B24 — Unit-state causal-loop audit
**Status: ACTIVE / DEFERRED**

Audit morale, cohesion, experience, training, readiness, fatigue, wear, logistics, intelligence, and related state variables for complete causal and recovery loops. Distinguish functioning simulation mechanisms from static modifiers or placeholders.

#### P2-B25 — Simulation API semantic equivalence
**Status: ACTIVE / DEFERRED**

Document and test the intended semantic relationship between direct `simulateTurn()` and session-based `advanceSimulation()`, including baseline/status behavior, so different public entry points cannot silently produce unexpected differences.

### P2-B26 — Headless DWST / interface independence architecture
**Status: ACTIVE / DESIGN REQUIREMENT — DEFERRED IMPLEMENTATION

DWST must remain independently usable as a simulation engine without requiring ORBAT Mapper for simulation correctness, state authority, turn resolution, or reporting. ORBAT Mapper remains one optional visualization/presentation adapter.

The architecture must support at least these independent consumption modes without duplicating simulation logic:

1. **Map mode:** DWST canonical state and events are projected into ORBAT Mapper for geographic visualization.
2. **Headless/text mode:** DWST runs without a map UI and exposes structured state, events, orders, and after-action results suitable for a textual report or conversational interface.
3. **Programmatic/API mode:** an external client can submit validated DWST orders and consume deterministic simulation results without importing UI-specific code.
4. **Future visualization adapters:** other map or UI implementations can consume the same canonical state/event/read-model contracts without becoming simulation authorities.

Boundary requirements:
- The simulation kernel must never depend on Vue, ORBAT Mapper UI components, map rendering, browser state, or conversational/LLM logic.
- A text/AI interface may interpret human language into validated DWST orders and explain returned DWST results, but it must never invent simulation outcomes or become an alternate simulation authority.
- The canonical state, ruleset, turn resolver, event/AAR output, deterministic seed/state, and command log remain DWST-owned.
- Human-readable reporting must be generated from actual DWST results/state/events, not from narrative assumptions outside the engine.
- The interface layer must be replaceable: ORBAT Mapper and a conversational interface are consumers/adapters, not dependencies of the simulation kernel.
- Headless operation must be covered by automated tests that run the kernel without the ORBAT Mapper/UI layer.

This requirement does **not** require building the conversational interface now. It establishes the architectural boundary so that the current ORBAT Mapper implementation does not prevent independent/headless DWST use later.

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
- ORBAT Mapper remains an adapter/presentation layer;
- DWST can execute the simulation kernel headlessly without ORBAT Mapper/UI dependencies;
- structured state/event/AAR outputs are sufficient for a non-map reporting client;
- a conversational/AI interface, if added, remains an order/report adapter and never becomes simulation authority.

The deferred independent-audit findings P2-B12 through P2-B25 and the headless-independence requirement P2-B26 are also active completion requirements unless explicitly reclassified after direct verification. They must not be treated as optional cleanup merely because they were discovered after the original Phase-2 backlog was written.

## Current execution position

**Phase 2: IN PROGRESS.**

Current stage: **Stage 3 — Canonical accounting, deterministic resolution, and production gates.**

Completed tracked milestones: S18, S20, S21, S23, S33.

Active implementation: **P2-S27-B**, following implementation of S27-A.

Additional active backlog: **P2-B01 through P2-B26**. P2-B12 through P2-B25 were promoted from the independent direct repository audit and are intentionally deferred until the current critical-path S27 work and dependency chain are sufficiently advanced. P2-B26 establishes the independent/headless DWST architecture as a design requirement and is likewise deferred from immediate implementation.

The phase therefore has substantial work remaining even though the original six milestone items have mostly been completed. S27 remains the current critical-path item; the promoted backlog will be audited/closed in dependency order rather than treated as optional cleanup.

## Historical / audit record

The Architectural Blueprint/Audit Map and older architecture/refactor-gate documents remain discovery and historical artifacts. Their unresolved requirements have been promoted into this master plan rather than discarded. Findings discovered through those audits must be incorporated into the appropriate phase/item before implementation.

## Latest S27 execution record

- S27-A implementation commit: `dc897ab290ec863cd6d8b424aedca05072ce7a47`.
- S27-A focused-test commit: `efce9936d4bbf816ad38fc863db201728a8b5e93`.
- S27-A uses explicit canonical record IDs and dispositions; it does not invent casualty allocation.
- The focused test suite must pass CI before S27-A is marked validated.

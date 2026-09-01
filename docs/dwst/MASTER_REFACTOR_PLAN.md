# DWST Master Refactor Plan

## Mission
Refactor DWST into a deterministic, testable, era-aware simulation engine with explicit state authority, geographic spatial semantics, canonical accounting, and a clean visualization boundary.

## DWST architectural definition — non-negotiable project identity

DWST is a **generic simulation core**, not an individual historical scenario and not a graphics application. The Core provides the reusable simulation machinery; era packages and scenarios provide the content/configuration that the Core executes.

The authoritative conceptual flow:

`user selects era + scenario → validate/load era package and scenario → DWST Core executes → state/report outputs → consumers render or present the results`

### 1. DWST Core

The Core is era-agnostic in its architecture. It owns generic simulation mechanisms and contracts, including authoritative state, turn/session orchestration, movement, detection, combat orchestration, resource accounting, validation, deterministic execution, replay/provenance, and reporting interfaces. Core code must not contain hard-coded assumptions belonging to one historical era, battle, army, weapon system, or scenario.

### 2. Era package / ruleset

An era package supplies the rules, capabilities, definitions, and coefficients required to simulate a particular technological/historical era. Era-specific mechanics belong here, not in generic Core orchestration. The existence of an era-specific implementation must never require copying or forking the Core.

### 3. Scenario

A scenario supplies the concrete situation to simulate: forces/OOB, initial state, equipment/personnel data, geography, starting conditions, objectives, and scenario-specific configuration. A scenario is data/configuration consumed by the Core; it is not a replacement simulation engine.

### 4. Selection and bootstrap boundary

The application/bootstrap layer selects an era and scenario, validates that they are compatible and runnable, loads their definitions, and supplies them to the Core. Selection logic must not become a second simulation engine.

### 5. Consumers and presentation

ORBAT Mapper, a graphical UI, CLI, standalone/headless execution, written reports, and a future chat-like interface are **consumers of DWST**, not simulation authorities. They may render, query, submit valid commands through the public boundary, or present reports, but they must not maintain competing simulation state or duplicate Core rules.

DWST must therefore be capable of running without ORBAT Mapper or any graphical frontend. A standalone execution can take an era + scenario + commands, run the same Core, and return deterministic machine-readable and human-readable results suitable for a written/chat interaction.

### 6. One Core, many eras/scenarios

The intended architecture is:

`WW2 + Ardennes → same DWST Core`

`Cold War + Scenario X → same DWST Core`

`Modern + Scenario Y → same DWST Core`

Only the supplied era/scenario package changes. Core architecture, state authority, session semantics, deterministic execution, and public contracts remain shared.

### 7. Architectural prohibitions

- No era-specific scenario logic may be embedded in generic Core modules.
- No scenario may fork or replace the Core simulation pipeline.
- No frontend or visualization system may become simulation authority.
- No parallel session/state/resource engine may be introduced for a particular era, scenario, or frontend.
- No consumer may bypass the authoritative Core session/state/resource pipeline.
- Any future extension must preserve the separation between Core mechanisms, era rules, scenario data, and presentation/consumption.

This definition takes precedence over implementation convenience and must be preserved throughout the refactor.

## Working rules

1. Do not guess. Any uncertain behavior, architecture, dependency, historical fact, or implementation detail must be verified directly from the repository, tests, authoritative documentation, or explicitly marked as unknown.
2. Never start code or repository changes unless explicitly authorized by the user.
3. Inspect the actual current repository state before making implementation decisions; do not rely on stale summaries or memory.
4. Prefer the smallest safe change that establishes the required invariant without unrelated refactoring.
5. Keep the master plan synchronized with verified implementation status. All plan edits must follow Rule 23.
6. A green CI is evidence for the commit it ran against; do not generalize beyond what its tests actually establish. Plan closure requires satisfying the item's stated acceptance criteria.
7. Do not mark an item fixed merely because code exists. Verify behavior and, where required, consumer/dependency removal directly.
8. Never create a parallel or reconstructed version of the master plan when an update fails. Treat an ambiguous or failed plan write as not completed and follow Rule 23.
9. Preserve backward compatibility unless the plan explicitly authorizes a breaking change.
10. Keep simulation logic independent from visualization/adapters. ORBAT Mapper may render DWST state but must not become simulation authority.
11. Keep era-specific rules isolated from core state and orchestration. Historical assumptions belong in explicit era/ruleset modules.
12. Canonical state must have one authoritative representation for each physical/resource fact. Derived aggregates are projections, not competing authorities.
13. Simulation resolution should be deterministic for identical inputs, rules, and explicit RNG seeds/state.
14. Do not silently invent conversions between coordinate systems. Any spatial conversion must be explicit, tested, and owned by the correct boundary.
15. Pure resolution functions must not mutate supplied input state. State mutation belongs at an explicit application/commit boundary.
16. Accounting changes must reconcile between detailed canonical records and reported aggregates; unexplained discrepancies are failures, not acceptable approximation.
17. Regression tests must cover newly established invariants and must not be weakened merely to obtain green CI.
18. When repository tooling returns incomplete, truncated, stale, or contradictory data, stop and obtain a complete authoritative snapshot before writing.
19. When a finding is deferred, record it rather than silently dropping it. Deferred findings may be addressed later without reopening unrelated completed work.
20. Work in dependency order, but revalidate dependencies against the current repository before implementing a planned item.
21. Never mix unrelated fixes into an active task merely because they are discovered during inspection. Record them for later unless they are required to make the active task correct.
22. For every implementation task, inspect the relevant current code, tests, and callers/consumers before deciding the change is complete.
23. **Authoritative plan-update protocol — sole procedure for modifying this plan:**
   - Retrieve the current branch HEAD and the complete current plan blob before editing.
   - Obtain and retain the exact current blob SHA; it is the concurrency guard.
   - Never edit from a truncated display, stale copy, memory, or a reconstructed version of the plan.
   - Apply only the explicitly authorized change to the complete retrieved document; preserve all unrelated content exactly.
   - Serialize plan writes: never issue concurrent updates to this file.
   - Prefer the low-level Git Data workflow (new blob → tree → commit → branch ref) when the normal contents writer cannot safely accept the complete update. The high-level contents writer may be used when it reliably accepts the complete replacement and exact SHA.
   - If any write fails, is ambiguous, uses a stale SHA, or returns incomplete data, treat the update as **not completed**. Do not retry against the stale SHA and do not create an alternative plan.
   - After a successful write, re-fetch the resulting plan from the new commit/blob and verify both the intended change and preservation of the complete document.
   - Only after that verification may the plan be described as updated.
   - This Rule 23 supersedes any older or duplicate plan-edit procedure.

## Phase 2 — Canonical state and simulation integrity

### Pre-B-series findings

| ID | Finding | Status | Closure requirement |
|---|---|---|---|
| P2-S1 | Two operational turn-resolution models | CLOSED | Canonical `resolveTurn()` is the sole current operational turn-resolution path; no obsolete `resolveUnifiedTurn` implementation or consumer remains in the current tree. |
| P2-S2 | Duplicate spatial representations | CLOSED | `WorldPosition` is the sole physical-location authority in current operational state and movement. |
| P2-S3 | Duplicate detection implementations | CLOSED | Canonical `detectContacts()` is the operational detection implementation; no competing implementation remains in use. |
| P2-S4 | No verified x/y → geographic conversion | SATISFIED CONSTRAINT | Do not invent a conversion; geographic state remains authoritative. |
| P2-S5 | ORBAT Mapper map-coordinate ownership | SATISFIED | Visualization/projection remains outside simulation authority. |
| P2-S6 | Legacy BattlefieldState remains live | CLOSED | Legacy battlefield state is no longer an operational authority. |
| P2-S7 | Spatial consistency invariant | CLOSED | Geographic state and map/turn projection preserve the same authoritative position semantics. |

### Additional whole-repository architectural findings

| ID | Finding | Status | Closure requirement |
|---|---|---|---|
| P2-S20 | Two simulation-session paths coexist | CLOSED | The legacy `simulationSession.ts` path and its obsolete test were removed; remaining live consumers, including the UI and live-order simulation test, were migrated to the canonical resource-aware session. Direct repository search shows no remaining legacy `simulationSession` references, and post-migration CI is green. |
| P2-S21 | Canonical resource authority is incomplete | CLOSED | Canonical authority/reconciliation now covers ammunition and fuel in addition to personnel and equipment; canonical projection and live canonical-session commit are verified, with CI green. Actual ammunition consumption/recovery semantics remain a downstream logistics/sustainment concern and are tracked under B11 rather than being folded into S21. |
| P2-S22 | Legacy pool-based equipment/crew model remains structurally live | CLOSED | Direct repository inspection found no `EquipmentPool`/`CrewPool` implementation or operational references. Canonical equipment instances carry ownership/status, canonical personnel records carry ownership/status, crew assignments explicitly bind personnel to equipment instances, and combat allocation operates on those canonical records. No separate mutable equipment/crew pool authority remains. |
| P2-S23 | Two competing canonical resource representations exist | CLOSED | The S23 legacy-resource cleanup and compatibility audit are complete. Genuinely obsolete aggregate ledger/pool modules remain deleted; live consumers were migrated to canonical record-level state or preserved through narrow compatibility boundaries; canonical personnel/equipment/crew behavior and affected casualty reconciliation were verified; the final S23 validation CIs are green. No authority-bearing `CanonicalResourceLedger` implementation remains. |
| P2-S24 | Era rulesets are mutable shared objects | CLOSED | Era ruleset interfaces and nested configuration are readonly; the shared ruleset registry and nested configuration are deep-frozen so callers cannot mutate global era configuration. Regression coverage verifies registry/nested immutability, cross-caller isolation, and unchanged implemented-era discovery. Validation CI run 33286894752 is green (install, type-check, and unit tests). |
| P2-S25 | Replay provenance and command history are incomplete | CLOSED | Core-owned immutable replay provenance now records an explicit ordered command journal, `dwst-core-v1` model identity, deterministic ruleset content fingerprint, and explicit `rng: null` for the current deterministic engine. Canonical sessions retain and append the provenance journal without changing simulation mechanics. Regression coverage verifies provenance identity, command ordering/accumulation, and compatibility with the canonical session. Validation CI run 33288352957 is green (install, type-check, and unit tests). |
| P2-S26 | DWST has no formal public module/API boundary | CLOSED | A stable `src/dwst/index.ts` public entry point now exposes the supported Core/session/state/rules/provenance contracts; UI consumers were migrated away from deep `src/dwst/core` imports; public-boundary regression coverage passes; validation CIs 33289208603, 33289216087, and 33289220100 are green. |
| P2-S27 | Canonical projection can silently suppress invalid crew-definition data | CLOSED | Canonical projection now surfaces missing equipment definitions and invalid/missing crew requirements as explicit validation errors rather than silently swallowing failures and under-counting readiness. Regression fixtures were corrected to use valid canonical crew-definition references without weakening the validation invariant. Validation CI run 33290638712 is green (install, type-check, and unit tests). |
| P2-S28 | Canonical resource deltas are inferred from aggregate before/after state | CLOSED | Resolution now produces explicit typed resource deltas at the point resources are consumed or combat losses are applied; `resolveTurn()` aggregates those explicit deltas, and the canonical session consumes them without reconstructing resource changes from projected aggregate `UnitState` differences. Direct code audit found no remaining S28 before/after resource-delta reconstruction in the affected resolution/application path. Regression coverage for explicit combat resource deltas is present, and validation CI runs 33305140518, 33305161151, and 33305172297 are green. |
| P2-S29 | Era capability contract is not enforced at simulation entry | CLOSED | Simulation entry now rejects an era unless it is marked implemented and has the required combat/rules implementation, before canonical projection or turn execution. Regression coverage verifies an unsupported era fails at entry; final validation CI run 33305622901 passed type-check and the full unit suite (223 files, 1,741 tests; 5 skipped). |
| P2-S30 | Architecture documentation has drifted from the current tree | CLOSED | `ARCHITECTURE_AUDIT.md`, `RESOURCE_ACCOUNTING.md`, `CANONICAL_RESOURCE_ACCOUNTING.md`, and the relevant historical note were reconciled with the current repository architecture; historical findings are explicitly distinguished from current operational paths and the master plan remains authoritative for status. |
| P2-S31 | Canonical personnel/equipment ownership is optional and ambiguous | CLOSED | Canonical personnel and equipment now require an explicit `unitId` ownership value: a unit ID means unit-owned and `null` explicitly means non-unit/unassigned. Omitted ownership is rejected by the TypeScript contract and validation rejects empty ownership IDs. Affected fixtures were migrated to explicit ownership semantics, and validation CI run 33306698845 passed `pnpm type-check` and the full `pnpm test:unit --run` suite. |

**Scope rule for S20-S31:** these are architectural blockers discovered by the whole-repository audit. Their implementation and closure must be handled as their own findings. Existing B-series items must not re-open, duplicate, or claim closure of these findings. A B-series item may depend on an S20-S31 fix or validate a downstream invariant, but it must not silently absorb the S20-S31 scope.

## Verified audit non-findings / do-not-reopen register

The following items were directly inspected during whole-system audit and are **not architectural problems under the current repository architecture**. They must not be reopened merely because the same code pattern is encountered again. A future audit may reopen an item only if new direct evidence demonstrates a regression or contradicts the stated boundary.

1. **S28 aggregate before/after resource reconstruction:** ruled out in the current canonical path. `resolveTurn()` produces explicit typed resource deltas; the canonical session consumes those deltas; projection does not reconstruct resource losses from aggregate before/after differences.
2. **A second live combat authority in `rulesets.ts`:** ruled out. `rulesets.ts` is a compatibility view over `ERA_RULESETS`, not a second registry or combat implementation.
3. **`applyTurn()` calculating canonical resource losses:** ruled out. The canonical session commits explicit canonical resource deltas; `applyTurn()` applies an already-produced report and does not replace canonical accounting.
4. **Canonical projection reconstructing resource losses:** ruled out. Projection reads canonical personnel/equipment/consumable records and creates legacy aggregate views; it does not infer losses from aggregate state differences.
5. **ScenarioStore secretly replacing DWST canonical state:** not demonstrated. ScenarioStore maintains its own operational/time projection, but the audit found no verified bridge making it the DWST canonical simulation authority. Do not treat it as a competing DWST simulation engine without direct evidence of such a bridge.
6. **Positive consumable deltas as an S-series architectural violation:** ruled out as an S-series issue. Actual ammunition/fuel consumption and recovery semantics are downstream B11 concerns; canonical architecture does not itself impose WW2 logistics semantics.
7. **WW2 adapter zero-valued supporting factors automatically meaning broken WW2 combat:** ruled out. Direct WW2 tests establish intentional current behavior for the inspected factors; zero values alone are not evidence of an architectural defect.
8. **Public `applyTurn()` creating a public simulation-authority bypass:** not demonstrated. It is not exposed as the public package API, so its existence is not equivalent to an externally reachable authoritative bypass.
9. **S28 requiring removal of every legacy projection helper:** ruled out. S28 requires elimination of inferred resource-delta accounting, not deletion of every helper that applies an already-resolved report to a projected legacy state.
10. **S21 requiring monotonic ammunition/fuel consumption at the canonical commit layer:** ruled out. The master plan explicitly separates canonical resource authority from downstream logistics/sustainment semantics tracked under B11.
11. **Public executable era capability objects being an authoritative simulation bypass:** ruled out as a demonstrated problem. The public boundary intentionally exposes supported rules/ruleset contracts, while the internal turn-state mutation pipeline is not exposed as a consumer-facing authority. Public-boundary tests exercise the canonical session entry points rather than direct internal mutation.
12. **Bootstrap/selection being an established consumer bypass:** ruled out as a demonstrated problem. The inspected public integration path enters through `startCanonicalSimulation()` and `advanceCanonicalSimulation()`, consistent with the documented `consumer → public DWST API → canonical Core session → state/report outputs` architecture. No direct public `applyTurn()` authority was established.
13. **ScenarioStore merely having its own operational/time projection being a competing DWST authority:** ruled out absent an actual authority-crossing bridge. Its independent projection is not itself evidence of a second DWST simulation engine; future work should require direct evidence of a bridge before reopening this concern.

### Audit rule for the non-findings register

These are verified exclusions, not implementation TODOs. Future work must preserve the stated boundaries and should add a new finding only when direct repository evidence shows an actual authority violation, semantic contradiction, regression, or plan requirement that is not covered here.

### S27 — Canonical resource accounting bridge

**Status: CLOSED**

- S27-A: canonical commit contract — COMPLETE / CI GREEN.
- S27-B: deterministic allocation — COMPLETE / CI GREEN.
- S27-C: canonical projection boundary — COMPLETE / CI GREEN; WorldPosition fixture corrected to the actual `{lat, lon}` contract.
- S27-D: live canonical turn integration and regression coverage — COMPLETE / CI GREEN; both validation runs reported green by the user.

S27 establishes the canonical resource path:

`canonical records → projection → live simulation state → explicit deterministic allocation → canonical commit → projection`

No implicit casualty/equipment disposition guessing is permitted.

### Active B-series / remaining Phase-2 work

**B-series scope rule:** B01-B26 below are downstream implementation/verification tasks. They do not own or re-implement the architectural findings P2-S20 through P2-S31. Where a B item touches the same subsystem, it must consume the S-series architectural decision and verify only its own stated acceptance criteria.

B01 — Aggregate-vs-detailed reconciliation: **CLOSED / PASS.** Validated remaining aggregate mutation/projection paths after the P2-S21/P2-S23/P2-S28 architectural decisions; no conflicting authoritative aggregate mutation path was found. No code change required.

B02 — State transition invariants: **CLOSED / PASS.** Executable transition/commit behavior and relevant regression coverage were inspected; no actual B02 invariant violation was found. No code change required.

B03 — Direct combat/state mutation audit: **CLOSED / PASS.** Direct inspection of combat resolution, combat-result application, and the canonical commit boundary found no combat/state mutation bypass. Combat produces results and explicit resource deltas; state/resource mutation remains at the explicit application/commit boundary. No code change required.

B04 — Deterministic RNG: **CLOSED / PASS.** The implemented combat path is deterministic and currently contains no stochastic behavior requiring an RNG seed/state. No RNG was introduced merely to satisfy the task wording; P2-S25 provenance already records the current deterministic engine as `rng: null`. No code change required.

B05 — Accounting/replay regression: **CLOSED / PASS.** Canonical-session regression coverage verifies detailed resource/accounting reconciliation and provenance/journal continuity over turns; direct inspection found no accounting or replay defect requiring a change. No code change required.

B06 — Orders/command validation: **CLOSED / PASS.** Direct inspection of the actual order-execution boundary confirmed formation validation, typed order categories, command-quality/friction handling, structured execution results, and no inappropriate OOB mutation. Optional `deadline`/`dependencies` fields were not treated as a defect without evidence that B06 requires their enforcement in this boundary. No code change required.

B07 — Turn-entry and map invariants: **CLOSED / PASS.** Direct inspection verified the executable turn-entry, geographic-state, and projection-consistency invariants; no actual B07 defect was found and no code change was required. Closed without reopening S1-S7.

B08 — One authoritative turn-state commit boundary: **CLOSED / PASS.** Direct inspection verified the final live state mutation/commit boundary after P2-S20/P2-S28; canonical session/resource commit remains authoritative and no competing live turn-state commit path requiring a B08 fix was found. No code change required.

B09 — Detection/sensor integration: **CLOSED / PASS.** Direct inspection found the detector consuming the era detection policy and supplied scenario sensor inputs through the operational combat path; the B09 sensor capability integration fix was implemented and directly verified by validation CI run 33318584855 (type-check and unit tests green). No remaining B09 defect was found.

B10 — Combat ruleset isolation and era ownership: **CLOSED / PASS.** Direct inspection verified that Core combat orchestration selects the era ruleset while era-specific combat behavior remains supplied by the era package; the inspected WW2 resolver is not duplicated in generic combat orchestration. No B10 violation or unnecessary architectural cleanup was found. No code change required.

B11 — Logistics/sustainment semantics: **CLOSED / DEFERRED IMPLEMENTATION.** Baseline closure records that the canonical resource authority and explicit resource-delta pipeline are already established by P2-S21/P2-S23/P2-S28, and the current WW2 combat model already uses ammunition as a deterministic combat-effectiveness input. The remaining downstream rule is explicit ammunition/fuel consumption and recovery semantics, including a future mandatory era-level resource-lifecycle contract so new eras cannot silently omit those semantics. This implementation is intentionally deferred until after baseline system testing; it must not recreate or alter the canonical resource-authority architecture. No B11 code change is included in this closure.

B12 — Event/history accounting: **CLOSED / PASS.** Direct inspection found that turn resolution and canonical commit lacked a reliable projection from resolved state-changing actions into per-unit history. B12 was implemented with a narrow history-projection path so movement/combat state changes generate corresponding unit-history records while canonical state remains authoritative. Regression coverage verifies movement history, combat history for affected units, loss reconciliation, committed history, and resolution immutability. Validation CI run 33328862760 is green (type-check and full unit test suite).

B13 — Engagement integration: **CLOSED / PASS.** Direct inspection verified that canonical `detectContacts()` consumes the era detection policy and scenario-owned sensors, and that `resolveEngagements()` feeds detected opposing contacts into the era-owned combat resolver through the intended interface. The complete `resolveTurn()` path then applies the engagement result through the canonical combat/resource application boundary. Existing B13 regression coverage verifies sensor-dependent engagement creation and attacker/defender identification. No B13 code change was required.

B14 — Scenario validation: **CLOSED / PASS.** Direct inspection verified that invalid or incomplete scenarios are rejected before canonical simulation begins, while era capability/runnability remains delegated to P2-S29 rather than duplicated in scenario validation. Regression coverage verifies generic structural validation, invalid spatial/sensor/hierarchy references, rejection at canonical simulation entry, and separation from unsupported-era capability validation. Validation CIs 33330358772 and 33330366445 are green (install, type-check, and full unit suite); earlier intermediate validation CIs 33330271951 and 33330308862 failed during development and were superseded by the corrected commits. Future extension is intentionally supported through a generic/base validator plus era-owned scenario validation, so adding a new era can introduce era-specific scenario requirements without turning the generic validator into a central era-specific `if` chain or replacing the generic invariants. No further B14 code change is required.

B15 — Serialization/deserialization: **CLOSED / PASS.** Direct inspection verified the versioned serialization/deserialization boundary for ScenarioState, CanonicalState, and ReplayProvenance, including explicit format/kind/version checks and rejection of non-finite JSON values. Regression coverage verifies scenario/canonical/provenance round-trips, malformed/incompatible input rejection, and non-finite-number rejection. Validation CI run 33331635855 is green (type-check and full unit test suite); earlier CI 33331626936 failed against the pre-fix B15 commit and was superseded by the corrected commit. No further B15 code change is required.

B16 — CLI/API boundary: **CLOSED / PASS.** Direct inspection verified that external consumers enter through the stable public DWST API established by P2-S26, while canonical simulation/session mutation remains owned by the Core. No separate CLI/API simulation authority, deep-Core consumer bypass, competing session/state pipeline, or adapter-side duplication of Core rules was found. The public-boundary and canonical-session paths were inspected directly, and no B16 code change was required. B16 was closed as a verification-only task; no new CI run was required because its acceptance criteria were satisfied by direct repository inspection and the existing public-boundary validation evidence.

B17 — Visualization projection: **CLOSED / PASS.** Direct inspection verified that ORBAT Mapper remains a consumer/projection layer over canonical scenario state and export configuration; it does not own competing simulation state, turn resolution, resource accounting, movement/detection/combat authority, or a parallel simulation session. The inspected ORBAT Mapper settings/export boundary reads canonical scenario state and writes only export-form data. No B17 code change was required; closed as a verification-only task.

B18 — Standalone reporting: **CLOSED / PASS.** Implemented a deterministic written-report formatter over the canonical `SimulationReport` contract, with regression coverage for stable output. The formatter is a presentation/consumer layer only: it interprets authoritative Core results and does not perform simulation, mutate canonical state, or create a parallel session. Validation CI runs 33449276707, 33449284449, and 33449295147 are green for type-check and the full unit suite. Closed after direct acceptance review and CI verification.

B19 — Reporting determinism: **CLOSED / PASS.** Strengthened deterministic report generation by establishing stable unit-ID ordering for machine-readable turn reports and added regression coverage proving logically identical inputs with different unit insertion orders produce identical machine-readable reports. The human-readable formatter already normalizes event/unit/resource-delta ordering and remains a pure presentation layer. Validation CI runs 33450399113 and 33450435912 are green for type-check and the full unit suite. Closed after direct acceptance review and CI verification.

B20 — Scenario/era fixture coverage: **CLOSED / PASS.** Direct inspection and CI verification established representative WW2/Ardennes canonical scenario coverage while preserving the generic-Core boundary. The Ardennes scenario was canonicalized and restructured within the existing simulation parameters, with historical force/organization/geography corrections and deterministic individual personnel/equipment records. The original problematic demo path was removed from the active canonical simulation path, but a deliberately simple standalone demo file remains as a lightweight demonstration/regression fixture and does not replace or duplicate the authoritative Core simulation pipeline. CI run 33453609357 (`test: keep canonical demo regression lightweight`) passed successfully for the retained demo. The generic live-order Core test was restructured to use an isolated deterministic synthetic fixture rather than Ardennes data, preventing future historical-scenario changes from breaking unrelated Core tests. Ardennes-specific behavior remains scenario/integration data rather than Core logic. Closed after direct acceptance review and CI verification.

B21 — Performance/resource profile: **CLOSED / PASS.** Implemented a dedicated Vitest benchmark for the canonical simulation session using a deterministic controlled 20-unit workload. The benchmark separately measures canonical-session startup, one canonical turn, and a 20-turn run through the authoritative `startCanonicalSimulation()` / `advanceCanonicalSimulation()` path; measured iterations are warmed up and the workload setup is separated from measured turn execution. Canonical normalized resource values and explicit equipment definitions are used so the fixture is accepted by the existing validation guards. CI run 33460656245 passed dependency installation, type-check, the full unit suite (1,761 tests passed; 5 skipped), and the B21 benchmark. That CI run established the verified CI baseline on Ubuntu 24.04.4 / Node 22.23.2 / pnpm 10.26.2 / Vitest 4.1.11: startup mean 0.581 ms, one-turn mean 0.974 ms, and 20-turn mean 17.247 ms (approximately 0.862 ms/turn for the measured 20-turn workload). These values are recorded as a CI baseline, not as a universal desktop performance guarantee, and the benchmark does not impose any turn limit on normal simulation execution. Future hardening: pin the benchmark tooling/Vitest version for longer-term baseline reproducibility; this is a later maintenance item and is not a B21 closure blocker. Closed after direct acceptance review and successful CI benchmark execution.

B22 — Full-system simulation test: **CLOSED / PASS.** Implemented a dedicated, deterministic B22 full-system integration suite using an isolated representative fixture rather than Demo or Ardennes data. The suite exercises the authoritative `startCanonicalSimulation()` / `advanceCanonicalSimulation()` pipeline across five turns and verifies canonical-to-projected personnel/equipment/consumable reconciliation after each turn, turn/time continuity, movement and combat event production, explicit resource-delta production, provenance command accumulation/order and ruleset fingerprint, input immutability, and deterministic repeatability of final state/canonical/provenance. The fixture is explicitly selected and isolated so adding unrelated scenarios/fixtures does not automatically affect B22. The suite uses the currently implemented WW2 ruleset through the generic era-ruleset boundary rather than embedding era-specific mechanics in Core. Validation CI run 33465084000 passed dependency installation, type-check, the full unit suite, and the benchmark suite. An earlier B22 CI run 33464705724 correctly exposed an invalid fixture value; the fixture was corrected to the existing normalized ammunition/fuel contract without weakening validation or changing the Core. Closed after direct acceptance review and successful full CI execution.

B23 — Branch/main integration readiness: **CLOSED / PASS.** Direct inspection verified Phase-2 invariants and current CI on the audit branch. CI run 33476077770 passed dependency installation, type-check, the full unit suite, and the benchmark suite. The audit branch was compared directly against `main` from the merge base; `main` is 15 commits ahead, but the substantive DWST changes in those commits are already represented or superseded by the later audited refactor state, while temporary/staging artifacts are not candidates for import. No immediate reconciliation with `main` is required, and the audit branch remains intentionally isolated; no merge into `main` was performed as part of B23. Eventual main integration remains a separate controlled post-Phase-2 operation and must be revalidated with full CI. Closed after direct acceptance review and CI verification.

B24 — Final legacy-path audit: perform the final sweep for superseded paths **after P2-S22/P2-S30 are resolved**; do not duplicate their migration/documentation work.

B25 — Plan/repository synchronization audit: verify every closed plan item against repository evidence before Phase-2 completion; P2-S30 owns documentation reconciliation.

B26 — Phase-2 completion gate: all mandatory acceptance criteria, CI, replay/accounting, and full-system tests must pass before declaring Phase 2 complete.

## Deferred findings / later hardening

Findings discovered during audits that are not prerequisites for the active task must be recorded here and addressed later in dependency order. They must not be silently mixed into unrelated fixes.

Known deferred areas include deeper sensor realism, broader combat-model fidelity, performance optimization, and any architectural cleanup not required by the active Phase-2 acceptance criteria.

## Execution discipline

For each task:

1. Read this plan from the current authoritative branch.
2. Inspect the current repository implementation and tests directly.
3. Establish the exact acceptance criteria and dependencies.
4. Obtain explicit authorization before changing code.
5. Make the smallest safe implementation.
6. Test the affected behavior and inspect CI results.
7. Re-audit the changed boundary for regressions and unintended authority paths.
8. Update this plan only after the implementation status is actually verified, using Rule 23.
9. Never claim a task is complete when evidence is incomplete.

# DWST Master Refactor Plan

## Mission
Refactor DWST into a deterministic, testable, era-aware simulation engine with explicit state authority, geographic spatial semantics, canonical accounting, and a clean visualization boundary.

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
| P2-S20 | Two simulation-session paths coexist | OPEN | The production/UI path must use the canonical resource-aware session, or the two session models must be formally unified. No live UI path may bypass canonical resource authority. |
| P2-S21 | Canonical resource authority is incomplete | OPEN | Extend canonical authority/reconciliation beyond personnel and equipment to every resource represented as authoritative simulation state, including ammunition and fuel, or explicitly redesign those fields as derived projections. |
| P2-S22 | Legacy pool-based equipment/crew model remains structurally live | OPEN | Remove or quarantine the `EquipmentPool`/`CrewPool` model and migrate all operational consumers to canonical equipment instances/personnel assignments. There must be one equipment/crew accounting architecture. |
| P2-S23 | Two competing canonical resource representations exist | OPEN | Unify `CanonicalState` record-level authority with the separate `CanonicalResourceLedger` model, or explicitly designate one as non-authoritative compatibility data and remove its authority-bearing APIs. |
| P2-S24 | Era rulesets are mutable shared objects | OPEN | Make ruleset/configuration immutable or session-owned so one caller cannot mutate global `ERA_RULESETS` and silently alter another simulation. Determinism must include configuration isolation. |
| P2-S25 | Replay provenance and command history are incomplete | OPEN | Persist an explicit ordered command journal plus ruleset/model version or content hash and any RNG state/seed required to reproduce a run. A state snapshot alone must be sufficient to identify the exact model used for replay. |
| P2-S26 | DWST has no formal public module/API boundary | OPEN | Establish a stable DWST entry point/API separating simulation core from ORBAT Mapper internals; UI and future standalone/phone/reporting clients must not depend on deep internal file paths. |
| P2-S27 | Canonical projection can silently suppress invalid crew-definition data | OPEN | Projection must surface invalid/missing crew requirements as explicit validation errors rather than swallowing exceptions and continuing with under-counted readiness. |
| P2-S28 | Canonical resource deltas are inferred from aggregate before/after state | OPEN | Make resolution/application produce explicit typed resource deltas or canonical commits instead of reconstructing accounting changes by subtracting projected aggregate `UnitState` values. |
| P2-S29 | Era capability contract is not enforced at simulation entry | OPEN | Starting a simulation must validate that the selected era is actually runnable, including required combat/rules implementations; unsupported eras must fail before partial simulation rather than only when combat is reached. |
| P2-S30 | Architecture documentation has drifted from the current tree | OPEN | Reconcile `ARCHITECTURE_AUDIT.md`, resource-accounting documentation, notes, and the master plan with the actual current tree so removed modules are not documented as live and current duplicate models are not omitted. |
| P2-S31 | Canonical personnel/equipment ownership is optional and ambiguous | OPEN | Define explicit ownership semantics for unassigned canonical records (unit, reserve, depot, pool, etc.) and enforce them. `unitId` must not be optional without a defined non-unit ownership model. |

**Scope rule for S20-S31:** these are architectural blockers discovered by the whole-repository audit. Their implementation and closure must be handled as their own findings. Existing B-series items must not re-open, duplicate, or claim closure of these findings. A B-series item may depend on an S20-S31 fix or validate a downstream invariant, but it must not silently absorb the S20-S31 scope.

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

B01 — Aggregate-vs-detailed reconciliation: validate remaining aggregate mutation/projection paths **after P2-S21/P2-S23/P2-S28 decisions are implemented**; do not duplicate their architectural unification work.

B02 — State transition invariants: strengthen executable invariants around valid state transitions, without redefining session/resource architecture from P2-S20.

B03 — Direct combat/state mutation audit: ensure combat produces results and does not bypass the explicit application/commit boundary; do not absorb P2-S28's explicit resource-delta architecture.

B04 — Deterministic RNG: make stochastic behavior reproducible from explicit seed/state; consume P2-S25's provenance decision rather than redefining replay provenance.

B05 — Accounting/replay regression: prove detailed accounting and replay determinism over representative turns **after P2-S25 is resolved**; do not duplicate command-journal/model-version architecture.

B06 — Orders/command validation: enforce valid orders and command semantics at the correct boundary; command history persistence remains P2-S25 scope.

B07 — Turn-entry and map invariants: retain executable checks for turn entry, geographic state, and projection consistency; do not reopen closed S1-S7 architecture.

B08 — One authoritative turn-state commit boundary: consolidate/verify the final live state mutation boundary **after P2-S20/P2-S28 architectural decisions**; do not duplicate their session or resource-ledger unification work.

B09 — Detection/sensor integration: ensure actual sensor inputs and policies reach detection rather than silently defaulting to unaided detection.

B10 — Combat ruleset isolation and era ownership: maintain separation between core orchestration and era-specific combat behavior **after P2-S24/P2-S29 ruleset architecture is settled**; do not duplicate mutable-ruleset or capability-entry fixes.

B11 — Logistics/sustainment semantics: verify resource consumption and recovery rules are explicit and deterministic **using the canonical resource authority established by P2-S21/P2-S23/P2-S28**; do not recreate that architecture here.

B12 — Event/history accounting: ensure events and unit history reconcile with committed state changes; command-journal provenance remains P2-S25 scope.

B13 — Engagement integration: verify canonical detection feeds engagement resolution through the intended interface.

B14 — Scenario validation: reject invalid/incomplete scenarios before simulation, including capability checks delegated to P2-S29.

B15 — Serialization/deserialization: round-trip canonical state without semantic loss, including whatever provenance/resource structures are established by P2-S21/P2-S25.

B16 — CLI/API boundary: keep external interfaces thin and prevent adapter logic from becoming simulation authority **after P2-S26 establishes the public DWST API boundary**; B16 must validate adapter behavior, not redefine the API architecture.

B17 — Visualization projection: preserve ORBAT Mapper as a consumer/projection layer only.

B18 — Standalone reporting: DWST must support operation without a graphical map by producing deterministic written simulation reports suitable for a chat-like interaction.

B19 — Reporting determinism: identical simulation inputs must produce stable machine-readable and human-readable reports apart from explicitly permitted presentation metadata.

B20 — Scenario/era fixture coverage: maintain representative fixtures across supported eras without leaking era-specific assumptions into core.

B21 — Performance/resource profile: establish practical runtime/resource expectations for desktop and constrained environments after correctness is stable.

B22 — Full-system simulation test: exercise a representative multi-turn scenario through the complete authoritative pipeline **after the S20-S31 architectural blockers and prerequisite B tasks are resolved**.

B23 — Branch/main integration readiness: verify Phase-2 invariants and CI before merging the refactor branch into main; do not merge merely because individual tasks are green.

B24 — Final legacy-path audit: perform the final sweep for superseded paths **after P2-S22/P2-S30 are resolved**; do not duplicate their migration/documentation work.

B25 — Plan/repository synchronization audit: verify every closed plan item against repository evidence before Phase-2 completion.

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

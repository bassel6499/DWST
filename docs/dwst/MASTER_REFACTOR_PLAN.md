# DWST Master Refactor Plan

> **Document role:** This is the authoritative refactor/work-plan document. It preserves the original long-term roadmap, all historical findings and completed work, and the current verified audit state. The Architectural Blueprint is a discovery/debugging map only; it is not a competing roadmap. It is the **single plan file**; operational synchronization state is maintained here so there is no second plan-state authority.

## 0. Governing rules

1. **Direct evidence only.** No architectural change, ruling, deletion, compatibility decision, or closure may be based on speculation. Use direct repository observation, tests/CI evidence, or verified external research.
2. **CI is a gate, not proof of architecture.** Green CI proves the checked behavior/build passes; it does not by itself prove that an architecture is canonical or that the whole simulation is correct.
3. **One authoritative physical position.** A simulated unit has one authoritative physical position: `UnitState.position: WorldPosition`.
4. **ORBAT Mapper is the map authority.** DWST must not implement a competing map projection/rendering/mapping system. DWST supplies geographic positions and simulation results; ORBAT Mapper owns map projection and map rendering/conversion at the UI/map boundary.
5. **Derived coordinates are not state authority.** Any grid/local/map-library coordinate must be derived from canonical geographic position through an explicit, verified reference/conversion. It must never become a second physical location.
6. **No information fabrication.** Migration adapters must not invent personnel, equipment, crew, coordinates, terrain, or other state that cannot be established from authoritative inputs.
7. **Delete only after proving zero required consumers.** Legacy code remains until its live dependencies are migrated and CI proves the replacement.
8. **Record new findings before implementation.** Every newly confirmed architectural defect or requirement discovered during the audit must be added to the appropriate phase/item here before acting on it.
9. **Era neutrality is mandatory.** WW2, Cold War, modern, future, and hypothetical behavior are selectable rulesets/scenarios; none may define or contaminate the era-agnostic core mechanics.
10. **Blueprint discipline.** The Architectural Blueprint is a discovery and debugging index only. It maps what exists, what it does, who depends on whom, and known risks. It does not schedule implementation or override phase order. Newly discovered defects found through blueprint tracing are recorded as findings in the active master-plan phases.
11. **Roadmap separation.** The original long-term DWST roadmap and the current refactor plan are both authoritative, but serve different purposes. The long-term roadmap defines project phases and end-state scope; this document defines the currently active architectural/refactor work. Neither may silently replace the other.
12. **No duplicate work.** Before opening a new implementation item, reconcile it against completed findings, the long-term roadmap, current source, and prior CI evidence. A completed architectural correction must not be reintroduced as new work merely because its historical roadmap item remains listed.
13. **Repository-source verification is mandatory.** Never use GitHub/code-search results as evidence that a file, symbol, consumer, or implementation does or does not exist. Search indexes may be incomplete, stale, or broken. For architecture audits, dependency audits, deletion decisions, and closure decisions, inspect the current branch's actual repository tree and source files directly. Search may be used only as a convenience to locate candidates; it is never sufficient evidence of absence or completeness.
14. **Audit closure requires direct inspection.** Do not close an audit because search returns zero results. Closure requires direct inspection of the relevant repository paths/files and, where practical, tracing their consumers and checking the resulting source state. CI remains a separate gate and does not replace this inspection.
15. **CI reporting protocol.** When CI is triggered or discovered to be running, report that it is running and wait for its result. Do not call it green until its completed result is directly verified or the user manually confirms it. If the user manually inspects a run and reports it green, record that as user-confirmed CI evidence. If CI fails, stop the validation sequence and inspect the failure before proceeding.
16. **No source changes during audit-only work.** A whole-system audit may identify defects, but identification does not authorize implementation. Each corrective source change requires explicit user authorization unless the user has explicitly authorized that specific batch of changes.
17. **Do not fix the same problem twice.** Before implementation, check this plan's findings log, completed items, current source, current commit history, and CI evidence. If a problem was already resolved, do not reopen it without direct evidence of regression or reintroduction.
18. **Plan synchronization is mandatory.** After each authorized implementation item and its validation, update this plan with the exact result before beginning the next implementation item. Plan-only restructuring may consolidate presentation, but must not erase historical records.
19. **Preserve historical record.** When restructuring this document, retain the original roadmap, completed work, findings, dates, CI identifiers, architectural decisions, and rejected/removed legacy paths. Historical material may be reorganized or cross-referenced, but not silently discarded.
20. **Whole-system distinction.** A module-level green test suite is not equivalent to an end-to-end simulation validation. The plan must distinguish source/architecture audit, unit tests, integration tests, UI-path tests, and whole-simulation behavioral validation.
21. **Single-file lossless synchronization protocol.** This file is the only authoritative plan. Before every plan write: read the current branch ref directly; obtain the complete current plan blob by exact SHA; preserve the complete document; make only the required documentation edits; replace the same file atomically using its current blob SHA; immediately re-read the resulting blob and verify that the long-term roadmap, historical records, active findings, statuses, CI identifiers, rules, and synchronization record remain present. Never reconstruct the plan from a partial/truncated read, never create a second plan-state file, and never use search output as the document source. If the complete blob or write operation is unavailable, do not advance implementation; resolve the repository-tooling problem first.
22. **Single canonical plan location.** The sole plan file remains `docs/dwst/MASTER_REFACTOR_PLAN.md`. Do not create or recreate `PLAN_STATE.md`, a second master plan, or another competing plan ledger. The temporary `docs/dwst/plan/` migration attempt was discarded because it was incomplete; its data is not authoritative.
23. **Every result is recorded before advancement.** Findings, implementation commits, failed CI, successful CI, user-confirmed CI, rejected approaches, deletions, and architecture decisions are recorded here before the next unrelated implementation item begins. A stale plan blocks advancement.
24. **Direct-check-before-claim rule.** For every file/symbol/consumer/CI claim that can be checked directly, perform the direct repository/CI check in the current branch before reporting the claim. Do not substitute search summaries, remembered state, or prior chat claims when a direct check is available.

## 1. Long-term DWST roadmap — preserved project-level roadmap

This section preserves the original project roadmap as the forward-looking structure. It is **not** the detailed implementation checklist for the current refactor. Current refactor findings such as P2-S18 onward are subordinate implementation/audit steps and do not create a second competing project roadmap.

### Phase 0 — Rules of engagement / architectural principles
**Status: Established.** Governing architectural constraints, evidence requirements, canonical-state rules, era neutrality, and map-boundary principles are enforced by this plan.

### Phase 1 — Foundation / canonical architecture
**Status: Substantially completed through the work leading into the current refactor.** Canonical state, scenario/turn boundaries, resource/personnel/equipment authority, and the core architectural foundation have been established; remaining defects discovered during the Phase 2 audit are tracked below rather than reopening Phase 1 generically.

### Phase 2 — Ruleset architecture + core architecture audit
**Status: Active — whole-system audit/restructuring now in progress.** The earlier spatial/canonical-state cleanup items are substantially advanced, but the whole-system audit has exposed additional integration, state-authority, simulation-path, and ruleset-completeness problems. These are recorded below and must be resolved or explicitly carried forward before Phase 2 can close.

### Phase 3 — WW2 combat ruleset completion
**Status: Future.** Complete and validate the WW2 ruleset as a selectable era/scenario implementation after the generic core is architecturally clean. WW2 remains an era implementation, never the generic engine model.

### Phase 4 — Playable end-to-end simulation
**Status: Future, but current audit has identified prerequisites that must be cleared before declaring this phase complete.** Build/validate the complete playable simulation loop on the canonical architecture, including scenario setup, turn resolution/application, movement, detection, combat, sustainment, and reporting as required by product scope.

### Phase 5 — ORBAT Mapper integration / visualization
**Status: Future / existing integration audited as needed.** Expand host/map integration without creating a competing DWST map/projection system. ORBAT Mapper remains responsible for map rendering and coordinate conversion at that boundary.

### Phase 6 — Extensible era architecture
**Status: Future.** Generalize and harden selectable-ruleset architecture so additional eras can be added without contaminating generic core mechanics.

### Phase 7 — Command / morale / higher-level behavioral systems
**Status: Future.** Add higher-level command, morale, readiness, behavior, and related simulation systems required by product scope, while preserving canonical state and era boundaries.

### Phase 8 — Logistics / sustainment expansion
**Status: Future / partially represented in the current core.** Expand logistics and sustainment into the full project capability defined by the roadmap, without restoring legacy battlefield-state dependencies.

### Phase 9 — Operational visualization / presentation
**Status: Future.** Complete operational presentation and visualization capabilities at the appropriate host/UI boundary.

### Phase 10 — AAR / after-action reporting
**Status: Future.** Develop complete after-action reporting and result inspection around canonical simulation outputs.

### Phase 11 — Comprehensive validation / verification
**Status: Future.** Perform whole-system behavioral, architectural, regression, and evidence-based validation. CI remains a gate, not architectural proof.

### Phase 12 — Multi-resolution simulation
**Status: Future.** Add multiple simulation resolutions/scales without creating conflicting state authorities or era leakage.

### Phase 13 — Additional eras
**Status: Future.** Add additional selectable eras/rulesets after the extensible architecture is validated.

### Phase 14 — Final integration / product hardening
**Status: Future.** Integrate completed capabilities, remove justified remaining legacy surfaces, harden interfaces, and stabilize the product.

### Phase 15 — Final product state
**Status: Future end state.** DWST reaches the intended integrated, validated, extensible simulation product state.

**Roadmap interpretation rule:** the statuses above are project-level. Detailed Phase 2 findings below may be completed, split, superseded, or added without changing the existence or order of the long-term phases. New findings must be attached to the appropriate phase rather than creating an accidental second roadmap.

## 2. Architectural Blueprint / Audit Map

### Purpose and status

**This section is a map, not the work plan.**

Use it to answer:

- What systems exist?
- What does each system own/do?
- What depends on it?
- What does it depend on?
- What state is authoritative versus derived?
- What known bugs/risks touch it?
- Where should an investigation start when a problem appears?

**Do not use this section to decide what gets coded next.** The long-term roadmap establishes project phase order; the detailed active phase sections establish implementation/audit order. The blueprint may expose a new defect; when direct evidence confirms that defect, add it to the appropriate phase and continue according to phase priority.

### A. System authority and dependency map

```text
ORBAT Mapper / host map
  owns: map rendering, UI projection, map-coordinate conversion
          │ supplies/consumes canonical geographic scenario/unit data
          ▼
DWST scenario boundary
  owns: ScenarioState assembly and scenario inputs
          │
          ▼
DWST generic core
  owns: turn orchestration, canonical state transitions, generic detection
        pipeline, combat orchestration, logistics/sustainment, time, spatial
        invariants and canonical projections
          │ selects policy/mechanics through
          ▼
Era ruleset layer
  owns: selectable era-specific coefficients and combat/assessment/detection
        policy
          │
          ▼
Simulation report / resulting UnitState
          │
          └── returned to host/scenario consumers
```

**Connection notes:**

- ORBAT Mapper does not become DWST's simulation authority.
- DWST does not create a competing map/projection layer.
- Era rulesets do not own canonical scenario state.
- Generic core orchestration must remain era-neutral.
- The live UI path must eventually converge on the same canonical simulation/session semantics as the tested core path; parallel UI-only simulation semantics are an audit risk.

### B. Spatial subsystem map

**Authority:** `UnitState.position: WorldPosition`

```text
WorldPosition contract
  spatialPosition.ts
       │ validates/defines
       ▼
UnitState.position  ← authoritative current physical location
       │
       ├── spatialInvariant.ts
       │     checks authority and state consistency
       │
       ├── geographicMovement.ts
       │     owns canonical geographic distance/interpolation primitives
       │
       ├── engine.ts
       │     consumes geographic operations for movement
       │
       ├── detection.ts
       │     consumes geographic distance for contact range
       │
       ├── combat.ts
       │     consumes contact outcomes; must not create a second position
       │
       ├── scenario/import/export boundary
       │     supplies geographic inputs/geometry
       │
       └── ORBAT Mapper / MapAdapter
             derives UI/map coordinates from geographic state
```

**Spatial risk ledger:**

- Resolved: legacy x/y battlefield authority.
- Resolved: engine Cartesian interpolation of lon/lat.
- Resolved: detection's duplicate approximate geographic distance; `detection.ts` now consumes canonical `geographicDistanceMeters()`.
- Resolved: legacy duplicate `src/dwst/core/movement.ts`; the standalone approximate geographic movement implementation was removed after direct consumer/boundary inspection established it was redundant with the active canonical `engine.ts` + `geographicMovement.ts` path. CI for the deletion commit was confirmed green by the user.
- Resolved for the currently evidenced repository state: the final P2-S21 sweep found no remaining duplicate characteristic geographic-distance implementation or antimeridian-unsafe simulation movement calculation after the legacy movement module removal.

### C. Turn-resolution map

```text
ScenarioState
   │
   ▼
resolveTurn()             pure resolution
   ├── movement
   ├── sustainment/logistics
   ├── readiness/fatigue/wear
   ├── detection
   └── era-selected combat
   │
   ▼
SimulationReport
   │
   ▼
applyTurn()               explicit application
   │
   ▼
next ScenarioState
```

**Primary modules:** `engine.ts`, `combat.ts`, `detection.ts`, logistics/sustainment modules, `eraRules.ts`.

**Current audit warning:** the map above is the intended architecture. The current implementation does not yet satisfy every box; specifically, the active engine has simplified inline sustainment while a separate `sustainment.ts` contains another model, and the prior UI/session paths differed in baseline/status handling. P2-S25 is now closed by the P2-S37 correction; P2-S26 remains open for sustainment consolidation.

### D. Era/ruleset map

```text
ScenarioState.era
      │
      ▼
getEraRuleset(era)
      ├── engine coefficients
      ├── resolveCombat
      ├── unit assessment policy
      └── detection policy
```

**Current rule:** generic orchestration stays core; historical/era-specific mechanics and coefficients stay selectable.

**Current implementation:** one canonical detection pipeline remains in `detection.ts`; `DetectionPolicy` is selected through the era ruleset and parameterizes range/sensor/intelligence/readiness/weather/terrain/confidence behavior without duplicating detection by era.

**Current audit warning:** WW2 combined-arms parameters exist in the WW2 combat API but the current `eraRules.ts` invocation supplies zero for all of them. This is tracked as P2-S28 and belongs to the WW2 ruleset completion work, not a generic-core rewrite.

### E. Canonical records and derived projections

```text
Canonical records
  ├── PersonnelRegistry
  ├── EquipmentInstance[]
  ├── InstanceCrewAssignment[]
  └── EquipmentDefinition[]
          │
          ▼
canonicalProjection.ts
          │
          ▼
derived aggregate/resource view
```

**Authority rule:** derived projections never replace canonical records.

**Current audit warning:** combat currently mutates `UnitState.personnel` / `UnitState.equipment` directly without a demonstrated commit bridge to the canonical personnel/equipment records. This is tracked as P2-S27.

### F. Compatibility / legacy map

```text
Compatibility entry point
      │
      ├── direct source consumers?
      ├── tests?
      ├── public API/export consumers?
      └── replacement already canonical?
               │
               ▼
        migrate / prove absent
               │
               ▼
             delete
```

**Resolved:** `resolveWW2Engagements()` was not present in the current `combat.ts` at the audited commit and is not an active deletion item.

**Current audit focus:** distinguish true compatibility surfaces from active simulation paths and do not allow legacy adapters to become hidden alternate authorities.

### G. Debugging entry guide

| Problem | Start here | Trace next |
| --- | --- | --- |
| Current location wrong | `spatialPosition.ts` | invariant → geographic operations → scenario input → map boundary |
| Movement wrong | `geographicMovement.ts` | `engine.ts` → movement tests → live UI order construction |
| Contact/range wrong | `detection.ts` | geographic distance → selected detection policy → `combat.ts` |
| Combat wrong | `combat.ts` | selected `EraRuleset` → scenario combat module → canonical resource commit |
| Era leakage | `eraRules.ts` | core imports/callers → scenario modules |
| Unexpected mutation | `resolveTurn()` | `applyTurn()` → mutation tests → non-core helpers |
| Personnel/equipment mismatch | canonical records | projections → combat/sustainment commits → crew/equipment contracts |
| Map wrong, simulation right | ORBAT Mapper boundary | `MapAdapter`/projection layer |
| Geographic anomaly | spatial map | inspect all direct consumers + legacy pattern search |
| Legacy compatibility concern | compatibility map | direct consumers → replacement → CI |
| UI order does not execute | command panel/parser | demo/session path → order schema → engine consumer |
| Turn duration does nothing | command panel | `turnHours` ownership → ScenarioState → engine |
| Scenario unavailable | scenario registry | definitions → registration → UI/session lookup |
| Simulation status stale | `simulationSession.ts` / assessment | baseline lifecycle → engine result → apply path |

## 3. Phase 2 — Canonical state / spatial consolidation and whole-system audit

### 3.1 Completed / verified historical work

The following historical records are intentionally retained rather than rewritten away:

- Canonical `UnitState` uses `WorldPosition` (`lon`, `lat`).
- Canonical `ScenarioState` and `resolveTurn()` / `applyTurn()` establish a pure-resolution plus explicit-application boundary.
- Canonical resource state remains an aggregate/resource authority and does not replace the individual personnel registry.
- Redundant simulation-step cloning was removed and CI subsequently passed.
- The map-facing DWST path consumes canonical scenario state and geographic positions.
- `DwstMapOverlay.vue` duplicate `defineProps` declaration was removed; CI run `33100195482` passed type-check and unit tests.
- The active WW2 demo entry point was migrated from `runWW2Turn()` to the generic `simulateTurn()` path and CI run `33106939476` passed type-check and unit tests.
- The duplicate WW2 square-law implementation was consolidated into the selectable WW2 scenario layer; the old `core/ww2SquareLaw.ts` implementation was removed and CI runs `33107940693` and `33107899018` passed type-check and unit tests.
- Standalone `src/dwst/core/battlefield.ts` was removed after direct evidence showed zero required current consumers for its `BattlefieldState`, `moveUnit`, and `terrainAt` contract.
- Direct inspection confirms canonical spatial state is represented at the correct level: `UnitState.position: WorldPosition`. Spatial state does **not** belong in `CanonicalState`, which remains resource/personnel/equipment authority.
- The legacy `src/dwst/core/detection.ts` compatibility detector was reduced to the canonical `detectContacts(ScenarioState, ...)` implementation using `WorldPosition`; the deleted battlefield-based detector is not restored.
- Legacy `src/dwst/core/simulationState.ts` was removed after direct inspection established it was part of the retired operational battlefield model and had no required current consumers.
- Default generic engine coefficients are centralized in `eraRules.ts`; duplicate local defaults in `engine.ts` were removed.
- P2-S17 canonical geographic movement operations were added and CI validated.
- P2-S7 executable core spatial invariants were added and CI validated.
- The obsolete `src/dwst/core/ww2.ts` compatibility facade was removed after direct commit/diff inspection established that it contained only forwarding exports and the deprecated `runWW2Turn()` wrapper; WW2 combat functionality was already owned by the selectable WW2 scenario layer and turn orchestration by the generic simulation pipeline. CI run `33117957851` passed type-check and unit tests after the subsequent WW2 fixture correction.
- P2-S18 detection geographic-distance refactor was implemented and focused regression-tested. Branch workflow run `33169899441` at commit `5f79471c8688cf738c3dcf6c72e1ef3dec6561b9` validated the accumulated branch state.
- P2-S19 minimal era-owned detection-policy boundary was implemented without duplicating the contact pipeline; focused boundary tests were added and workflow run `33169899441` passed on that tip.
- P2-S20 direct source audit found `engagementModel.ts` and `combatArms.ts` to be unused core modules carrying WW2/industrial-era square-law assumptions. Both were removed; accumulated branch CI was green.
- Direct current-source inspection found no surviving `resolveWW2Engagements()` compatibility wrapper in `src/dwst/core/combat.ts`.
- P2-S21 legacy duplicate movement implementation was removed after direct inspection of the repository tree, core consumers, application/UI path, package configuration, and canonical engine/geographic movement sources established the standalone `src/dwst/core/movement.ts` was redundant and had no required consumer. The deletion commit `e372d8fc9bc9b330ec32830c2d3b3f5a5e5eddb5` was manually confirmed by the user as green CI under the run named `remove legacy duplicate movement implementation`.
- P2-S22 established roadmap/refactor-plan separation and synchronization rules and explicit repository-source verification requirements.

### 3.2 Closed historical findings

#### P2-S7 — Executable core spatial invariants
**Status: Closed / validated.** Historical work retained above.

#### P2-S17 — Canonical geographic movement operations
**Status: Closed / validated.** Historical work retained above.

#### P2-S18 — Detection duplicated legacy approximate geographic distance math
**Status: Closed.** `detection.ts` consumes canonical `geographicDistanceMeters()`.

#### P2-S19 — Detection policy boundary for selectable eras
**Status: Closed for the currently evidenced boundary.** Generic core retains one canonical detection loop; policy comes from the selected era ruleset.

#### P2-S20 — WW2-specific mechanics remained in generic core after facade removal
**Status: Closed.** Unused WW2-specific core modules were removed without creating a generic replacement.

#### P2-S21 — Repository-wide legacy geographic-distance and antimeridian audit
**Status: Closed for the currently evidenced repository state.** The redundant legacy movement module was removed and post-deletion direct inspection plus user-confirmed green CI validated the resulting source state.

#### P2-S22 — Master-plan state synchronization / roadmap separation
**Status: Closed as a process/documentation control and superseded by the single-file synchronization rules in this revision.** Historical content remains preserved.

### 3.3 Newly confirmed whole-system findings — recorded before implementation

These findings were established during the whole-system audit of the current source state. **They are recorded here before implementation. No source change is authorized by this list itself.**

#### P2-S23 — Live UI movement order has no executable geographic destination
**Severity: Critical functional integration defect.**

**Resolution/implementation:** Added generic scenario-owned geographic locations and a resolver. Named objectives are resolved into canonical `Order.destination: WorldPosition`; explicit destinations are preserved; unknown objectives do not receive invented coordinates. The canonical movement engine was not duplicated or replaced. The live command-to-simulation path was covered by integration tests.

**CI history:** initial integration-test commit `6f4ae00f08904940f78c8d04474e9fca97caa1c3` failed run `33255461370` because the test dereferenced an optional location. Correction commit `77c37f93592d23a35c629e9aac61362a76b68c30` fixed type-check, but CI run `33255660136` then failed because the test incorrectly assumed movement must increase latitude. The actual moved latitude was `50.05527054769334` versus initial `50.2`. This was a test-design defect, not evidence that geographic movement was wrong. The corrective commit `a4df75f97256a17d057de84670660638e5ec9f7b` now asserts that canonical geographic distance to the resolved destination decreases.

**Status:** Open pending CI validation of `a4df75f97256a17d057de84670660638e5ec9f7b`.

#### P2-S24 — UI turn-duration selector disconnected from simulation state
**Severity: High functional integration defect.**

**Resolution:** The command panel now receives canonical `turnHours` and emits `update:turnHours`; the demo writes it into `session.state.turnHours`.

**Validation:** final implementation commit `40d1506cd45f5f6785c95fa44a9d2d56d0b3baa1` was user-confirmed green in CI run `33206531980`. Intermediate commit `881020a739a4f29b33729d4c43c7d147b4b2ca8a` produced CI run `33206514848` red because the parent prop contract had not yet been updated; the final correction passed.

**Status:** Closed / validated.

#### P2-S25 — Live UI simulation bypassed the baseline/status assessment lifecycle
**Severity: Critical simulation-integrity defect.**

**Resolution:** Live `DwstDemoView` was routed through `startSimulation()` and `advanceSimulation()` so `SimulationSession` owns the live baseline/ruleset lifecycle.

**Validation:** implementation commit `84f1fe7e35020e374fd7e55f3e8e28a2ce02dd7d`; user-confirmed green CI run `33205394873`.

**Status:** Closed / validated by P2-S37.

#### P2-S26 — Competing sustainment models and mutation-boundary violation
**Severity: Critical architectural defect.**

`engine.ts` contains inline fatigue/logistics/readiness/fuel behavior while `sustainment.ts` contains another model and directly mutates `UnitState`. Required end state: one canonical pure sustainment model feeding `resolveTurn()` and explicit `applyTurn()` mutation.

**Status:** Open — architecture decision required before implementation.

#### P2-S27 — Combat resource state is not demonstrated to commit to canonical personnel/equipment records
**Severity: Critical architectural/state-authority defect.**

Required end state: establish canonical authority and explicit resource deltas/commit semantics.

**Status:** Open — architecture decision required before implementation.

#### P2-S28 — WW2 combined-arms combat inputs are present in the API but currently hard-coded to zero
**Severity: High ruleset-completeness defect.**

Required end state: evidence-based WW2 inputs through selectable ruleset, or explicit staged-capability documentation; never restore WW2 assumptions to generic core.

**Status:** Open — primarily Phase 3.

#### P2-S29 — Engine `combatPower` calculation is not consumed by active WW2 combat law
**Severity: High model-coherence defect.**

Required end state: one documented relationship between combat power and WW2 combat quality, or explicit demotion/removal of redundant metric.

**Status:** Open — architecture/model decision required.

#### P2-S30 — Combat casualty application does not itself complete unit-status/state assessment
**Severity: High simulation-integrity defect.**

Required end state: one post-combat state transition/assessment path.

**Status:** Open.

#### P2-S31 — Logistics supply accounting has inconsistent delivered/lost semantics
**Severity: High functional defect.**

Required end state: requested = delivered + lost + explicitly documented residual/shortfall, with boundary tests.

**Status:** Open — implementation not started.

#### P2-S32 — Scenario registry is not connected to the current runnable scenario set
**Severity: High integration defect.**

Required end state: one scenario-definition/registry authority or explicit future-only scope.

**Status:** Open — implementation not started.

#### P2-S33 — Competing Ardennes scenario definitions exist
**Severity: High scenario-authority defect.**

**Resolution:** Direct consumer/source inspection established the duplicate definitions were obsolete competing fixtures. `src/dwst/scenarios/ardenne-1944.ts` and `src/dwst/scenarios/ardenne1944.ts` were removed; populated `src/dwst/scenarios/ardennes1944.ts` remains. Both deletion CIs were user-confirmed green. Direct audit also established that the application's `scenariostore` geographic subsystem and DWST simulation scenario fixture are separate systems with no verified integration path. Do not couple them merely to resolve DWST objectives.

**Status:** Closed / validated.

#### P2-S34 — Map overlay is not on the actual DWST demo application path
**Severity: High integration defect.**

Required end state: determine host/map integration contract without creating a second map authority. ORBAT Mapper remains responsible for map rendering/projection/conversion.

**Status:** Open — architecture/integration decision required.

#### P2-S35 — Whole-system/UI test coverage does not exercise the live application path
**Severity: High validation gap.**

Required end state: scenario load → command creation → order resolution → simulation → state update → report/UI/map presentation on the real user path.

**Status:** Open — validation design required.

#### P2-S36 — Reinforcement/reconstitution/training helpers require explicit mutation-boundary classification
**Severity: Medium architectural consistency defect.**

Required end state: classify each helper as pure calculation, explicit transition, or legacy/inactive surface and migrate active behavior to the canonical transition boundary.

**Status:** Open — consumer audit required.

#### P2-S37 — Active simulation path and auxiliary simulation modules are not yet proven to have one behavioral contract
**Severity: High architectural/integration defect.**

**Resolution:** live `DwstDemoView` was routed through `SimulationSession` using `startSimulation()` and `advanceSimulation()`. `simulateTurn()` remains a lower-level pure one-turn helper rather than a second live lifecycle.

**Validation:** implementation commit `84f1fe7e35020e374fd7e55f3e8e28a2ce02dd7d`; user-confirmed green CI run `33205394873`.

**Status:** Closed / validated.

### 3.4 Scenario/location architecture constraint

The application's `scenariostore` geographic model and DWST simulation scenario model are separate systems with no verified integration path. Do not introduce an implicit dependency between them merely to resolve DWST objectives.

DWST owns canonical `WorldPosition` and scenario-owned named geographic objectives. ORBAT Mapper remains the external map-display authority. The generic DWST location layer does not render maps, convert map coordinates, or replace ORBAT Mapper.

### 3.5 Dependency-aware execution order after restructuring

#### Stage A — Establish the canonical live simulation contract
1. P2-S37 — closed / validated.
2. P2-S25 — closed / validated by S37.
3. P2-S24 — closed / validated.
4. P2-S23 — implementation complete; corrected integration test awaiting green CI.
5. Close S23 only after CI and direct source re-inspection.

#### Stage B — Re-establish canonical state mutation/resource authority
6. P2-S27 — personnel/equipment canonical authority.
7. P2-S30 — post-combat casualty/status assessment.
8. P2-S26 — sustainment consolidation.
9. P2-S36 — reinforcement/reconstitution/training mutation classification.
10. P2-S31 — logistics accounting semantics and boundary tests.

#### Stage C — Reconcile combat model/ruleset boundaries
11. P2-S29 — combat-power relationship.
12. P2-S28 — WW2 combined-arms ruleset completion/staging.

#### Stage D — Scenario and visualization integration
13. P2-S33 — closed; duplicate Ardennes definitions removed and scenario/scenariostore separation established.
14. P2-S32 — scenario registry authority.
15. P2-S34 — map integration boundary/live overlay.

#### Stage E — Whole-system validation
16. P2-S35 — end-to-end validation layer.
17. Re-run direct repository audit for duplicate state authority, duplicate simulation paths, era leakage, coordinate systems, mutation boundaries, scenario authority, and map boundaries.
18. Run CI as a gate; report running/waiting status explicitly; require completed result before closure.
19. User performs manual CI verification where requested; record the result.
20. Only after the above is clean may Phase 2 be considered for closure.

### 3.6 Authorization rule

The findings above are recorded, not automatically authorized. Before each new implementation:

1. re-read the current branch source;
2. verify the finding still exists;
3. verify no previous fix has already addressed it;
4. identify all direct consumers and relevant tests;
5. make the minimum justified change;
6. run relevant focused tests;
7. trigger/check CI;
8. explicitly tell the user CI is running and wait for the result;
9. independently re-inspect the architecture/source;
10. update this plan before moving to the next item.

## 4. Phase 3–15 future work relationship to the new audit

The new findings do **not** reorder or erase the original roadmap.

- **Phase 3:** P2-S28 and P2-S29 may feed WW2 combat-ruleset completion once Phase 2 establishes generic boundaries.
- **Phase 4:** P2-S23 through P2-S25, P2-S30, P2-S32, P2-S34, and P2-S35 are prerequisites/inputs for a genuinely playable end-to-end simulation.
- **Phase 5:** P2-S34 informs host/map integration without changing ORBAT Mapper ownership.
- **Phase 8:** P2-S26 and P2-S31 inform future full logistics/sustainment expansion.
- **Phase 11:** P2-S35 and the final Phase 2 audit feed comprehensive validation; Phase 11 remains the broader final verification phase and must not be falsely marked complete by current CI.
- **Phases 6–15:** remain future roadmap stages and are not pulled forward merely because related scaffolding already exists.

## 5. Historical findings log — preserved

- 2026-08-27: Direct inspection confirmed canonical map path uses geographic `WorldPosition`.
- 2026-08-27: Direct inspection confirmed legacy x/y battlefield movement/detection paths had existed and were being retired.
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
- 2026-08-27: Direct inspection confirmed the generic engine directly interpolated geographic longitude/latitude as Cartesian values; recorded as P2-S17 before correction.
- 2026-08-27: Direct inspection confirmed the host map/import-export architecture already provides GeoJSON geographic handling and ORBAT Mapper owns map conversion, so the engine correction must remain a small core geographic operation rather than a second map/projection system.
- 2026-08-28: P2-S18 closed after canonical geographic distance adoption and green accumulated branch CI.
- 2026-08-28: P2-S19 closed after implementing the minimal era-owned detection policy boundary and green accumulated branch CI.
- 2026-08-28: P2-S20 closed after direct audit/removal of unused WW2-specific core modules and green accumulated branch CI.
- 2026-08-28: P2-S21 opened for repository-wide legacy geographic-distance and antimeridian audit.
- 2026-08-28: P2-S22 established roadmap/refactor-plan separation and synchronization rules to prevent future plan drift or duplicate work.
- 2026-08-28: Added explicit repository-source verification rules after GitHub code-search returned false negatives for symbols/files directly confirmed to exist in the current branch.
- 2026-08-28: P2-S21 confirmed `src/dwst/core/movement.ts` was a legacy duplicate of the canonical geographic movement path; direct application/package/export/consumer inspection found no required dependency, so deletion was authorized and performed in commit `e372d8fc9bc9b330ec32830c2d3b3f5a5e5eddb5`.
- 2026-08-28: Post-deletion direct inspection confirmed `movement.ts` was absent, `engine.ts` still used canonical geographic operations, and the final spatial sweep found no remaining characteristic remnants of the removed approximate implementation.
- 2026-08-28: P2-S21 closed for the currently evidenced repository state; future duplicate geographic-distance or antimeridian-unsafe simulation logic must be recorded as a new finding before implementation.
- 2026-08-28: Whole-system audit identified P2-S23 through P2-S37. These are recorded before implementation and are dependency-ordered to prevent downstream fixes from masking or duplicating upstream architectural corrections.
- 2026-08-28: Restructured the master plan while preserving the original long-term roadmap, historical findings, completed work, CI identifiers, architectural rules, and blueprint/audit-map distinction.
- 2026-08-28: Strengthened the plan's CI reporting protocol: when CI is running, report that it is running and wait; do not infer green from partial results; user-confirmed manual inspection may be recorded as validation evidence.
- 2026-08-29: P2-S37 live simulation-path correction committed as `84f1fe7e35020e374fd7e55f3e8e28a2ce02dd7d`; user confirmed CI run `33205394873` green. The live DWST demo now uses `SimulationSession` for canonical baseline/ruleset lifecycle.
- 2026-08-29: P2-S25 closed by the P2-S37 correction; no duplicate source fix was created.
- 2026-08-29: P2-S24 turn-duration binding implemented in commits `881020a739a4f29b33729d4c43c7d147b4b2ca8a` and `40d1506cd45f5f6785c95fa44a9d2d56d0b3baa1`. User confirmed CI run `33206514848` red on the intermediate commit due to the expected parent-prop type-check gap, then CI run `33206531980` green on the final commit. The intermediate failure is retained as validation history, not an unresolved defect.
- 2026-08-29: Added a lossless master-plan update protocol requiring complete blob retrieval by exact SHA, atomic full-document replacement, and post-write verification so future plan synchronization cannot rely on truncated reads or accidentally discard historical material.
- 2026-08-29: Direct consumer/source audit established the two duplicate Ardennes scenario definitions were obsolete; `src/dwst/scenarios/ardenne-1944.ts` and `src/dwst/scenarios/ardenne1944.ts` were removed. Both deletion CIs were user-confirmed green. `src/dwst/scenarios/ardennes1944.ts` remains the surviving populated fixture.
- 2026-08-29: Direct audit established the application `scenariostore` geographic subsystem and DWST simulation scenario fixture are separate systems with no verified integration path. This separation is now a permanent constraint on S23 and future scenario work.
- 2026-08-29: P2-S23 generic scenario-location contract/resolver implemented and integrated into live order-to-simulation path. The canonical movement engine was not replaced or duplicated.
- 2026-08-29: CI run `33255461370` failed on initial live integration-test commit `6f4ae00f08904940f78c8d04474e9fca97caa1c3` because the test dereferenced optional `locations` data. Correction `77c37f93592d23a35c629e9aac61362a76b68c30` made type-check pass but CI run `33255660136` failed the integration test because the test incorrectly assumed movement increases latitude. Actual movement was from latitude `50.2` to `50.05527054769334`.
- 2026-08-29: Corrected integration assertion commit `a4df75f97256a17d057de84670660638e5ec9f7b` now tests decreasing canonical geographic distance to the resolved objective instead of an arbitrary latitude direction. CI validation is pending.
- 2026-08-29: The separate `PLAN_STATE.md` ledger was found to duplicate plan authority and permit synchronization drift. Its synchronization rules, checkpoint data, and relevant current findings are absorbed into this master plan. The separate ledger is retired and must not be recreated.
- 2026-08-29: A temporary `docs/dwst/plan/MASTER_REFACTOR_PLAN.md` migration file was created during restructuring but was discovered to be incomplete; it was deleted before becoming authoritative. No information from that incomplete file supersedes this plan. The authoritative plan remains this file, preserving the complete original roadmap/history and the absorbed ledger data.
- 2026-08-29: CI run `33255660136` was directly inspected: type-check passed and 222 test files/1733 tests passed before the single live movement integration assertion failed. The failure is recorded as a test-design defect, not a generic movement-engine failure.

## 6. Unified operational synchronization record

This section replaces the former separate `PLAN_STATE.md`. It is intentionally part of the authoritative master plan so there is exactly one source of truth.

### Current repository checkpoint
- Branch: `audit/canonical-state-refactor`
- Directly verified branch head before this synchronization: `68170ea47f67cbd5a5fe1407670e73077224ed55`.
- Complete source blob used for the pre-restructure master plan: `022643bca62ea4aad21b8a8dbb3a7bb3a9fb87ac`.
- Prior master-plan synchronization commit: `18be637fdfb5b797748843ed4689a5d3fc54b68a`.
- Corrected S23 test commit: `a4df75f97256a17d057de84670660638e5ec9f7b`.
- Unified plan migration attempt was deliberately discarded because its generated file was incomplete; it never became authoritative.

### Current verified implementation state
- P2-S24: closed; user-confirmed green CI `33206531980`.
- P2-S25: closed by P2-S37; user-confirmed green CI `33205394873`.
- P2-S37: closed; user-confirmed green CI `33205394873`.
- P2-S33: closed; duplicate Ardennes files removed; both deletion CIs user-confirmed green.
- P2-S23: implementation complete; corrected integration test awaiting CI. Failed runs `33255461370` and `33255660136` are historical validation records, not ignored.

### Permanent plan-maintenance protocol

1. **Direct branch check:** read the current branch ref directly before every plan operation.
2. **Exact complete source:** obtain the complete plan blob using its exact SHA. If a normal read is truncated, use the Git blob. Never reconstruct from search results or partial output.
3. **Single authority:** modify only `docs/dwst/MASTER_REFACTOR_PLAN.md`. Never create a second ledger or second roadmap.
4. **Preserve everything:** keep the original long-term roadmap, historical findings, dates, commits, CI identifiers, architecture decisions, rejected approaches, and removed legacy paths.
5. **Minimal edit:** change only the sections required by the new result.
6. **Atomic replacement:** update the file using its current blob SHA.
7. **Immediate verification:** re-read the resulting blob and directly verify the updated finding/status/CI plus preservation of the roadmap/history/rules.
8. **Record the synchronization checkpoint:** update Section 6 with the resulting plan commit/blob checkpoint as part of the same synchronization cycle when practical; otherwise the next plan sync must reconcile it before unrelated implementation.
9. **CI is recorded exactly:** red, running, green, and user-confirmed green are distinct states. Never overwrite a failure with a later success; retain the failure as history.
10. **Blocking rule:** if the plan cannot be safely synchronized, do not advance to an unrelated implementation item.
11. **Direct-check rule:** whenever a claim can be checked directly, check it directly in the current branch/CI before reporting it.

## 7. Current authoritative status

### Project roadmap
**Phase 0:** Established  
**Phase 1:** Substantially completed  
**Phase 2:** **ACTIVE — whole-system architecture/integration audit and restructuring**  
**Phase 3–15:** Future

### Refactor findings
**Closed:** P2-S7, P2-S17, P2-S18, P2-S19, P2-S20, P2-S21, P2-S22, P2-S24, P2-S25, P2-S33, P2-S37  
**Open:** P2-S23, P2-S26, P2-S27, P2-S28, P2-S29, P2-S30, P2-S31, P2-S32, P2-S34, P2-S35, P2-S36  

### Immediate next work
**P2-S23:** validate corrected live movement integration test commit `a4df75f97256a17d057de84670660638e5ec9f7b`. If green, directly re-inspect the implementation and close S23, then synchronize this document before moving to P2-S27.

**The original roadmap, historical findings, current audit findings, execution dependencies, architectural blueprint, CI history, and plan-synchronization rules are intentionally retained in this one authoritative document.**

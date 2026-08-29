# DWST Master Refactor Plan

> **Document role:** This is the single authoritative DWST refactor/work-plan document. It preserves the original long-term roadmap, historical findings, completed work, current audit state, architectural blueprint, CI history, and plan-synchronization rules. There is deliberately no separate plan-state ledger: operational synchronization state is maintained in this document itself.

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
18. **Plan synchronization is mandatory.** After each authorized implementation item and its validation, update this document with the exact result before beginning the next implementation item. Plan-only restructuring may consolidate presentation, but must not erase historical records.
19. **Preserve historical record.** When restructuring this document, retain the original roadmap, completed work, findings, dates, CI identifiers, architectural decisions, and rejected/removed legacy paths. Historical material may be reorganized or cross-referenced, but not silently discarded.
20. **Whole-system distinction.** A module-level green test suite is not equivalent to an end-to-end simulation validation. The plan must distinguish source/architecture audit, unit tests, integration tests, UI-path tests, and whole-simulation behavioral validation.
21. **Single-file lossless synchronization protocol.** This document is the only authoritative plan file. Before every plan write: read the current branch ref directly; obtain the complete current plan blob by exact SHA; preserve the complete document; make only the required documentation edits; replace the same file atomically using its current blob SHA; immediately re-read the resulting blob and verify that the long-term roadmap, historical records, active findings, statuses, CI identifiers, rules, and synchronization state remain present. Never reconstruct the plan from a partial/truncated read, never maintain a second plan-state file, and never use search output as the document source. If the complete blob or write operation is unavailable, do not advance implementation; resolve the repository-tooling problem first.
22. **Plan path is canonical.** The authoritative document lives at `docs/dwst/plan/MASTER_REFACTOR_PLAN.md`. The former `docs/dwst/MASTER_REFACTOR_PLAN.md` and `docs/dwst/PLAN_STATE.md` are retired after this unified migration and must not be recreated.
23. **Every result is recorded before advancement.** Findings, implementation commits, failed CI, successful CI, user-confirmed CI, rejected approaches, deletions, and architecture decisions are recorded here before the next unrelated implementation item begins. A stale plan blocks advancement.

## 1. Long-term DWST roadmap — preserved project-level roadmap

This section preserves the original project roadmap as the forward-looking structure. It is not the detailed implementation checklist for the current refactor. Current refactor findings such as P2-S18 onward are subordinate implementation/audit steps and do not create a second competing project roadmap.

### Phase 0 — Rules of engagement / architectural principles
**Status: Established.** Governing architectural constraints, evidence requirements, canonical-state rules, era neutrality, and map-boundary principles are enforced by this plan.

### Phase 1 — Foundation / canonical architecture
**Status: Substantially completed through the work leading into the current refactor.** Canonical state, scenario/turn boundaries, resource/personnel/equipment authority, and the core architectural foundation have been established; remaining defects discovered during the Phase 2 audit are tracked below rather than reopening Phase 1 generically.

### Phase 2 — Ruleset architecture + core architecture audit
**Status: Active — whole-system audit/restructuring now in progress.** Earlier spatial/canonical-state cleanup is substantially advanced, while integration, state-authority, simulation-path, and ruleset-completeness findings remain tracked below.

### Phase 3 — WW2 combat ruleset completion
**Status: Future.** Complete and validate the WW2 ruleset as a selectable era/scenario implementation after the generic core is architecturally clean. WW2 remains an era implementation, never the generic engine model.

### Phase 4 — Playable end-to-end simulation
**Status: Future, with current audit prerequisites.** Build/validate the complete playable simulation loop on the canonical architecture, including scenario setup, turn resolution/application, movement, detection, combat, sustainment, and reporting as required by product scope.

### Phase 5 — ORBAT Mapper integration / visualization
**Status: Future / existing integration audited as needed.** Expand host/map integration without creating a competing DWST map/projection system. ORBAT Mapper remains responsible for map rendering and coordinate conversion at that boundary.

### Phase 6 — Extensible era architecture
**Status: Future.** Generalize and harden selectable-ruleset architecture so additional eras can be added without contaminating generic core mechanics.

### Phase 7 — Command / morale / higher-level behavioral systems
**Status: Future.** Add higher-level command, morale, readiness, behavior, and related simulation systems required by product scope while preserving canonical state and era boundaries.

### Phase 8 — Logistics / sustainment expansion
**Status: Future / partially represented in the current core.** Expand logistics and sustainment into the full project capability defined by the roadmap without restoring legacy battlefield-state dependencies.

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

**Roadmap interpretation rule:** project-level statuses above remain distinct from Phase 2 implementation findings. New findings attach to the appropriate phase rather than creating another roadmap.

## 2. Architectural Blueprint / Audit Map

### Purpose and status

**This section is a map, not the work plan.** It answers what systems exist, what they own, dependencies, state authority, risks, and debugging entry points. It does not schedule implementation. The long-term roadmap and active Phase 2 execution order do that.

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

Connection rules:
- ORBAT Mapper does not become DWST simulation authority.
- DWST does not create a competing map/projection layer.
- Era rulesets do not own canonical scenario state.
- Generic core orchestration remains era-neutral.
- The live UI path must converge on the canonical simulation/session semantics as the tested core path.

### B. Spatial subsystem map

**Authority:** `UnitState.position: WorldPosition`

```text
WorldPosition contract
  spatialPosition.ts
       │
       ▼
UnitState.position  ← authoritative current physical location
       │
       ├── spatialInvariant.ts
       ├── geographicMovement.ts
       ├── engine.ts
       ├── detection.ts
       ├── combat.ts
       ├── scenario/import/export boundary
       └── ORBAT Mapper / MapAdapter
             derives UI/map coordinates from geographic state
```

Resolved spatial risks:
- legacy x/y battlefield authority;
- engine Cartesian interpolation of lon/lat;
- detection duplicate approximate geographic distance;
- legacy duplicate `src/dwst/core/movement.ts`;
- characteristic duplicate geographic-distance/antimeridian-unsafe simulation movement remnants for the evidenced current state.

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

Current audit warning: the intended map is not yet fully satisfied; the active engine has simplified inline sustainment while a separate `sustainment.ts` contains another model. P2-S26 remains open. P2-S25 is closed by P2-S37.

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

One canonical detection pipeline remains in `detection.ts`; policy is selected through the era ruleset. WW2 combined-arms inputs remain a Phase 3/P2-S28 item.

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

Combat's direct UnitState personnel/equipment mutation without a demonstrated canonical commit bridge remains P2-S27.

### F. Compatibility / legacy map

Compatibility entry points must be directly traced through consumers, tests, exports, replacement authority, migration, and CI before deletion. `resolveWW2Engagements()` is not an active deletion item in the current evidenced source.

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

The following historical records are intentionally retained:

- Canonical `UnitState` uses `WorldPosition` (`lon`, `lat`).
- Canonical `ScenarioState` and `resolveTurn()` / `applyTurn()` establish a pure-resolution plus explicit-application boundary.
- Canonical resource state remains an aggregate/resource authority and does not replace the individual personnel registry.
- Redundant simulation-step cloning was removed and CI subsequently passed.
- The map-facing DWST path consumes canonical scenario state and geographic positions.
- `DwstMapOverlay.vue` duplicate `defineProps` declaration was removed; CI run `33100195482` passed type-check and unit tests.
- The active WW2 demo entry point was migrated from `runWW2Turn()` to generic `simulateTurn()`; CI run `33106939476` passed type-check and unit tests.
- Duplicate WW2 square-law implementation was consolidated into the selectable WW2 scenario layer; old `core/ww2SquareLaw.ts` removed; CI runs `33107940693` and `33107899018` passed.
- Standalone `src/dwst/core/battlefield.ts` was removed after direct evidence showed zero required current consumers.
- Canonical spatial state was confirmed at `UnitState.position: WorldPosition`; spatial state does not belong in `CanonicalState`.
- Legacy `src/dwst/core/detection.ts` compatibility detector was reduced to the canonical `detectContacts(ScenarioState, ...)` implementation; deleted battlefield detector was not restored.
- Legacy `src/dwst/core/simulationState.ts` was removed after direct inspection established it was part of the retired operational battlefield model.
- Default generic engine coefficients were centralized in `eraRules.ts`; duplicate local defaults in `engine.ts` were removed.
- P2-S17 canonical geographic movement operations were added and CI validated.
- P2-S7 executable core spatial invariants were added and CI validated.
- Obsolete `src/dwst/core/ww2.ts` compatibility facade was removed after direct commit/diff inspection established it contained forwarding exports/deprecated `runWW2Turn()` only; CI run `33117957851` passed after fixture correction.
- P2-S18 detection geographic-distance refactor was implemented and focused regression-tested; workflow run `33169899441` validated accumulated branch state.
- P2-S19 minimal era-owned detection-policy boundary was implemented without duplicating the contact pipeline; workflow run `33169899441` passed.
- P2-S20 unused WW2-specific core modules `engagementModel.ts` and `combatArms.ts` were removed; accumulated branch CI was green.
- Direct current-source inspection found no surviving `resolveWW2Engagements()` compatibility wrapper in `src/dwst/core/combat.ts`.
- P2-S21 legacy duplicate movement implementation was removed after direct inspection; deletion commit `e372d8fc9bc9b330ec32830c2d3b3f5a5e5eddb5` was manually confirmed by the user as green CI under the run named `remove legacy duplicate movement implementation`.
- P2-S22 established roadmap/refactor-plan separation and synchronization rules.
- P2-S24 turn-duration binding was implemented in commits `881020a739a4f29b33729d4c43c7d147b4b2ca8a` and `40d1506cd45f5f6785c95fa44a9d2d56d0b3baa1`. User confirmed intermediate CI `33206514848` red due to the parent-prop type-check gap and final CI `33206531980` green.
- P2-S25 was closed by P2-S37; no duplicate fix was created.
- P2-S37 live simulation-path correction committed as `84f1fe7e35020e374fd7e55f3e8e28a2ce02dd7d`; user confirmed CI `33205394873` green.

### 3.2 Closed historical findings

#### P2-S7 — Executable core spatial invariants
**Status: Closed / validated.**

#### P2-S17 — Canonical geographic movement operations
**Status: Closed / validated.**

#### P2-S18 — Detection duplicated legacy approximate geographic distance math
**Status: Closed.**

#### P2-S19 — Detection policy boundary for selectable eras
**Status: Closed for the evidenced boundary.**

#### P2-S20 — WW2-specific mechanics remained in generic core after facade removal
**Status: Closed.**

#### P2-S21 — Repository-wide legacy geographic-distance and antimeridian audit
**Status: Closed for the evidenced repository state.**

#### P2-S22 — Master-plan state synchronization / roadmap separation
**Status: Closed as the original process control; superseded by the stronger single-file plan protocol in Rule 21–23.**

#### P2-S24 — UI turn-duration selector disconnected from simulation state
**Status: Closed / validated.**

#### P2-S25 — Live UI simulation bypassed baseline/status lifecycle
**Status: Closed / validated by P2-S37.**

#### P2-S37 — Active simulation path and auxiliary modules lacked one proven behavioral contract
**Status: Closed / validated.**

### 3.3 Newly confirmed whole-system findings — recorded before implementation

#### P2-S23 — Live UI movement order has no executable geographic destination
**Severity: Critical functional integration defect.**

**Resolution:** Added the generic DWST scenario-location contract/resolver and integrated objective resolution into the live order-to-simulation path. Scenario-owned named locations resolve to canonical `WorldPosition`; unknown objectives receive no invented destination; explicit destinations are preserved. The movement engine itself was not replaced or duplicated.

**Implementation:** scenario location contract/resolver, verified Ardennes Bastogne location, live-path integration, and integration tests.

**CI history:** integration test commit `6f4ae00f08904940f78c8d04474e9fca97caa1c3` failed run `33255461370` after type-check passed because the integration assertion expected latitude to increase, while the actual movement from the selected unit moved from latitude `50.2` to `50.05527054769334`. The failure was a test assertion error, not an engine type-check failure. A correction was committed as `77c37f93592d23a35c629e9aac61362a76b68c30`; its subsequent CI run `33255660136` passed type-check but failed the live integration test for the same incorrect latitude-direction assertion. This exposed a second test-design defect: movement toward an objective must be asserted by decreasing canonical geographic distance, not by assuming a particular latitude direction.

**Correction now committed:** `a4df75f97256a17d057de84670660638e5ec9f7b` changes the integration assertion to compare canonical `geographicDistanceMeters()` before and after movement. **Awaiting CI.**

**Architectural status:** Implementation complete; validation pending. Do not close until corrected CI is green.

#### P2-S24 — UI turn-duration selector disconnected from simulation state
**Status: Closed / validated.** See historical record above.

#### P2-S25 — Live UI simulation bypassed baseline/status assessment lifecycle
**Status: Closed / validated by P2-S37.**

#### P2-S26 — Competing sustainment models and mutation-boundary violation
**Severity: Critical architectural defect.**

`engine.ts` contains inline fatigue/logistics/readiness/fuel behavior while `sustainment.ts` contains another model and directly mutates `UnitState`. Required end state: one canonical pure sustainment model feeding `resolveTurn()` and explicit `applyTurn()` mutation.

**Status: Open — architecture decision required.**

#### P2-S27 — Combat resource state is not demonstrated to commit to canonical personnel/equipment records
**Severity: Critical architectural/state-authority defect.**

Required end state: establish authoritative ownership and explicit resource deltas/commit semantics.

**Status: Open — architecture decision required.**

#### P2-S28 — WW2 combined-arms combat inputs are present in the API but currently hard-coded to zero
**Severity: High ruleset-completeness defect.**

Required end state: evidence-based WW2 inputs through the selectable ruleset, or explicit staged capability documentation; never restore WW2 assumptions to generic core.

**Status: Open — Phase 3-oriented.**

#### P2-S29 — Engine `combatPower` calculation is not consumed by active WW2 combat law
**Severity: High model-coherence defect.**

Required end state: define one documented relationship between combat power and WW2 combat quality, or explicitly demote/remove a redundant metric.

**Status: Open — architecture/model decision required.**

#### P2-S30 — Combat casualty application does not itself complete unit-status/state assessment
**Severity: High simulation-integrity defect.**

Required end state: one post-combat state transition/assessment path.

**Status: Open.**

#### P2-S31 — Logistics supply accounting has inconsistent delivered/lost semantics
**Severity: High functional defect.**

Current model can yield unexplained residual supply under interdiction. Required end state: requested = delivered + lost + explicitly documented residual/shortfall, with boundary tests.

**Status: Open.**

#### P2-S32 — Scenario registry is not connected to the current runnable scenario set
**Severity: High integration defect.**

Registry APIs exist but the internal registry is empty and the demo constructs the scenario directly. Required end state: one scenario-definition/registry authority or an explicit future-only scope.

**Status: Open.**

#### P2-S33 — Competing Ardennes scenario definitions exist
**Severity: High scenario-authority defect.**

**Resolution:** Direct consumer/source inspection established the duplicate definitions were obsolete competing fixtures. `src/dwst/scenarios/ardenne-1944.ts` and `src/dwst/scenarios/ardenne1944.ts` were removed; populated `src/dwst/scenarios/ardennes1944.ts` remains. Both deletion CIs were user-confirmed green. The application `scenariostore` geographic subsystem and DWST scenario fixture were also directly established as separate systems with no verified integration path; they must not be implicitly coupled merely to resolve DWST objectives.

**Status: Closed / validated.**

#### P2-S34 — Map overlay is not on the actual DWST demo application path
**Severity: High integration defect.**

Determine intended host/map integration without creating a competing map authority. ORBAT Mapper remains responsible for rendering/projection/conversion.

**Status: Open — architecture/integration decision required.**

#### P2-S35 — Whole-system/UI test coverage does not exercise the live application path
**Severity: High validation gap.**

Required end state: scenario load → command → objective resolution → simulation → state update → report/UI/map presentation on the real path.

**Status: Open — validation design required.**

#### P2-S36 — Reinforcement/reconstitution/training helpers require explicit mutation-boundary classification
**Severity: Medium architectural consistency defect.**

Classify each helper as pure calculation, explicit transition, or legacy/inactive surface and migrate active behavior to the canonical transition boundary.

**Status: Open — consumer audit required.**

### 3.4 Scenario/location architectural finding from P2-S33/P2-S23

The application's `scenariostore` geographic model and DWST simulation scenario model are separate systems with no verified integration path. Do not turn `scenariostore/geo.ts` into DWST's simulation geographic authority.

DWST owns canonical `WorldPosition` and scenario-owned named geographic objectives. ORBAT Mapper remains the map-display authority. The generic DWST scenario location layer contains stable IDs, names, and canonical positions; it does not render maps, convert map coordinates, or implement a competing mapping engine.

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
17. Repeat direct repository audit for duplicate state authority, duplicate simulation paths, era leakage, coordinate systems, mutation boundaries, scenario authority, and map boundaries.
18. Run CI as a gate and report its status.
19. User manual CI verification where requested is recorded as such.
20. Only after all required Phase 2 items are clean may Phase 2 be considered for closure.

### 3.6 Authorization rule

Findings are recorded, not automatically authorized. Before each new implementation: re-read current source; verify the finding still exists; verify no prior fix; identify consumers/tests; make the minimum justified change; run focused tests; check CI; report/wait for CI; independently re-inspect; update this plan before advancing.

## 4. Phase 3–15 future work relationship to the new audit

- Phase 3: P2-S28/P2-S29 feed WW2 combat-ruleset completion after generic boundaries are clean.
- Phase 4: P2-S23–P2-S25, P2-S30, P2-S32, P2-S34, P2-S35 are prerequisites/inputs for a genuinely playable end-to-end simulation.
- Phase 5: P2-S34 informs host/map integration without changing ORBAT Mapper ownership.
- Phase 8: P2-S26/P2-S31 inform full logistics/sustainment expansion.
- Phase 11: P2-S35 and final Phase 2 audit feed comprehensive validation.
- Phases 6–15 remain future stages and are not pulled forward merely because scaffolding exists.

## 5. Historical findings log — preserved

- 2026-08-27: Direct inspection confirmed canonical map path uses geographic `WorldPosition`.
- 2026-08-27: Direct inspection confirmed legacy x/y battlefield movement/detection paths had existed and were being retired.
- 2026-08-27: Direct inspection confirmed canonical `resolveTurn()` and legacy `resolveUnifiedTurn()` had different state/mutation contracts.
- 2026-08-27: Verified ORBAT Mapper `MapAdapter` exposes geographic/map coordinate conversion; this is the host map boundary to reuse.
- 2026-08-27: Confirmed DWST has no verified semantic conversion from legacy battlefield `x/y` to `WorldPosition`; no such conversion is to be invented.
- 2026-08-27: Confirmed duplicate `defineProps` declaration in `DwstMapOverlay.vue`; removed and validated by green CI run `33100195482`.
- 2026-08-27: Corrected earlier detection finding: `core/combat.ts` already invokes canonical `detectContacts(state)` during engagement resolution.
- 2026-08-27: Confirmed WW2-specific turn orchestration remained in `src/dwst/core/ww2.ts`; active demo caller migrated to generic `simulateTurn()` and validated by green CI run `33106939476`.
- 2026-08-27: Confirmed duplicate WW2 square-law implementations across core and scenario layers; consolidated into selectable WW2 scenario layer and validated by green CI runs `33107940693` and `33107899018`.
- 2026-08-27: Confirmed standalone `src/dwst/core/battlefield.ts` was an independent x/y battlefield state implementation; deleted without replacement.
- 2026-08-27: Direct inspection confirmed `CanonicalState` is resource/personnel/equipment authority only while `UnitState.position: WorldPosition` is canonical physical position.
- 2026-08-27: Direct inspection confirmed `simulationState.ts` and a compatibility detector still depended on deleted `BattlefieldState`; both obsolete paths were removed.
- 2026-08-27: CI failures exposed the remaining dependency tail after battlefield removal: resolver, logistics, scenario registry, and Ardennes scenario; all were migrated/removed without restoring battlefield state, and final cleanup runs were green.
- 2026-08-27: Direct inspection confirmed generic engine directly interpolated geographic longitude/latitude as Cartesian values; recorded as P2-S17 before correction.
- 2026-08-27: Direct inspection confirmed host map/import-export architecture already provides GeoJSON geographic handling and ORBAT Mapper owns map conversion.
- 2026-08-28: P2-S18 closed after canonical geographic distance adoption and green accumulated branch CI.
- 2026-08-28: P2-S19 closed after minimal era-owned detection policy boundary and green accumulated branch CI.
- 2026-08-28: P2-S20 closed after direct audit/removal of unused WW2-specific core modules and green accumulated branch CI.
- 2026-08-28: P2-S21 opened for repository-wide legacy geographic-distance and antimeridian audit.
- 2026-08-28: P2-S22 established roadmap/refactor-plan separation and synchronization rules.
- 2026-08-28: Added explicit repository-source verification rules after GitHub code-search returned false negatives for symbols/files directly confirmed to exist in the current branch.
- 2026-08-28: P2-S21 confirmed `src/dwst/core/movement.ts` was a legacy duplicate of canonical geographic movement; direct application/package/export/consumer inspection found no required dependency; deletion commit `e372d8fc9bc9b330ec32830c2d3b3f5a5e5eddb5` was user-confirmed green.
- 2026-08-28: Post-deletion direct inspection confirmed `movement.ts` absent, `engine.ts` still used canonical geographic operations, and final spatial sweep found no remaining characteristic remnants.
- 2026-08-28: P2-S21 closed for the evidenced repository state.
- 2026-08-28: Whole-system audit identified P2-S23 through P2-S37; findings recorded before implementation and dependency-ordered.
- 2026-08-28: Master plan restructured while preserving original long-term roadmap, historical findings, completed work, CI identifiers, architectural rules, and blueprint/audit-map distinction.
- 2026-08-28: Strengthened CI reporting protocol.
- 2026-08-29: P2-S37 live simulation-path correction committed as `84f1fe7e35020e374fd7e55f3e8e28a2ce02dd7d`; user confirmed CI `33205394873` green.
- 2026-08-29: P2-S25 closed by P2-S37; no duplicate source fix.
- 2026-08-29: P2-S24 implemented in `881020a739a4f29b33729d4c43c7d147b4b2ca8a` and `40d1506cd45f5f6785c95fa44a9d2d56d0b3baa1`; CI `33206514848` red on intermediate type-check gap; `33206531980` green on final.
- 2026-08-29: Lossless plan synchronization protocol introduced after repeated plan drift/truncation problems.
- 2026-08-29: P2-S33 duplicate Ardennes files removed; both deletion CIs user-confirmed green. Surviving scenario is `src/dwst/scenarios/ardennes1944.ts`.
- 2026-08-29: P2-S33 established that application `scenariostore` geographic data and DWST simulation scenario data are separate systems with no verified integration path; no implicit coupling is permitted.
- 2026-08-29: P2-S23 generic scenario-location contract/resolver implemented; live path integrated; movement engine remained canonical.
- 2026-08-29: CI `33255461370` failed on the first live integration-test commit because the test dereferenced an optional location; correction `77c37f93592d23a35c629e9aac61362a76b68c30` fixed type-check but CI `33255660136` then failed the integration test because it assumed movement must increase latitude. The actual moved latitude was `50.05527054769334` versus the initial `50.2`. This was a test-design defect, not evidence that geographic movement was wrong.
- 2026-08-29: Corrected integration assertion commit `a4df75f97256a17d057de84670660638e5ec9f7b` now asserts movement by decreasing canonical geographic distance to the resolved destination. CI validation pending.
- 2026-08-29: The former separate `PLAN_STATE.md` was found to duplicate plan authority and introduce synchronization drift. The plan system is being consolidated into this single authoritative file under `docs/dwst/plan/`; its operational synchronization rules and checkpoint data are merged here rather than maintained separately.

## 6. Unified plan synchronization record

This section replaces the former separate `PLAN_STATE.md`. It is deliberately inside the authoritative plan so there is one source of truth.

### Current branch checkpoint
- Branch: `audit/canonical-state-refactor`
- Current branch head before this unified migration: `68170ea47f67cbd5a5fe1407670e73077224ed55`
- Prior complete master-plan blob: `022643bca62ea4aad21b8a8dbb3a7bb3a9fb87ac`
- Prior master-plan update commit: `18be637fdfb5b797748843ed4689a5d3fc54b68a`
- Unified-plan creation commit: to be recorded after creation.

### Current verified work state
- P2-S24: closed; user-confirmed green CI `33206531980`.
- P2-S25: closed by P2-S37; user-confirmed green CI `33205394873`.
- P2-S37: closed; user-confirmed green CI `33205394873`.
- P2-S33: closed; duplicate Ardennes definitions removed; both deletion CIs user-confirmed green.
- P2-S23: implementation complete; CI still red on integration-test assertion as of run `33255660136`; corrective commit `a4df75f97256a17d057de84670660638e5ec9f7b` awaits CI.

### Permanent operating procedure
1. Directly inspect the current branch ref before any plan operation.
2. Directly obtain the complete plan blob by exact SHA; never reconstruct from search or partial output.
3. Make the smallest documentation edit that records the actual finding/result.
4. Replace only `docs/dwst/plan/MASTER_REFACTOR_PLAN.md` using its current blob SHA.
5. Immediately re-read the resulting blob and verify preservation.
6. Record the resulting commit/blob checkpoint in Section 6 itself.
7. Do not create or maintain another plan-state file.
8. If the complete file or write operation is unavailable, block unrelated implementation until the tooling problem is resolved.
9. Every implementation result and every CI result must be recorded before the next unrelated implementation item.
10. Historical records may be reorganized but never silently discarded.

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

**The original roadmap, historical findings, architectural blueprint, active findings, execution dependencies, CI history, and synchronization rules are all intentionally contained in this single document. This is the sole authoritative DWST refactor/work-plan source.**

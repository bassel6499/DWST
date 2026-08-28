# DWST Master Refactor Plan

> **Document role:** This is the authoritative refactor/work-plan document. It preserves the original long-term roadmap, all historical findings and completed work, and the current verified audit state. The Architectural Blueprint is a discovery/debugging map only; it is not a competing roadmap.

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

## 1. Long-term DWST roadmap — preserved project-level roadmap

This section preserves the original project roadmap as the forward-looking structure. It is **not** the detailed implementation checklist for the current refactor. Current refactor findings such as P2-S18 onward are subordinate implementation/audit steps and do not create a second competing project roadmap.

### Phase 0 — Rules of engagement / architectural principles
**Status: Established.** Governing architectural constraints, evidence requirements, canonical-state rules, era neutrality, and map-boundary principles are enforced by this plan.

### Phase 1 — Foundation / canonical architecture
**Status: Substantially completed through the work leading into the current refactor.** Canonical state, scenario/turn boundaries, resource/personnel/equipment authority, and the core architectural foundation have been established; remaining defects discovered during the Phase 2 audit are tracked below rather than reopening Phase 1 generically.

### Phase 2 — Ruleset architecture + core architecture audit
**Status: Active — whole-system audit/restructuring now in progress.** The earlier spatial/canonical-state cleanup items are substantially advanced, but the whole-system audit has now exposed additional integration, state-authority, simulation-path, and ruleset-completeness problems. These are recorded below and must be resolved or explicitly carried forward before Phase 2 can close.

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

**Current audit warning:** the map above is the intended architecture. The current implementation does not yet satisfy every box; specifically, the active engine has simplified inline sustainment while a separate `sustainment.ts` contains another model, and UI/session paths differ in baseline/status handling. These are tracked as P2-S26 and P2-S25.

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
**Status: Closed as a process/documentation control, and now superseded by the stronger Phase 2 restructuring in this revision.** Historical content remains preserved.

### 3.3 Newly confirmed whole-system findings — recorded before implementation

These findings were established during the whole-system audit of the current source state. **They are recorded here before implementation. No source change is authorized by this list itself.**

#### P2-S23 — Live UI movement order has no executable geographic destination
**Severity: Critical functional integration defect.**

**Direct evidence:** the command parser creates movement orders containing an `objective` such as `Bastogne`, while the engine movement resolver requires `unit.order.destination`. The live demo feeds the parsed order into the unit. Therefore the normal UI movement command can display an order without supplying the geographic destination required by the engine.

**Required end state:** establish one canonical order representation for movement. A named objective must resolve through a verified scenario/objective registry or explicit geographic destination before the order enters simulation. No coordinates may be invented.

**Dependencies:** scenario/objective representation; UI command parsing; engine order schema; movement tests; end-to-end UI test.

**Status:** Open — implementation not started.

#### P2-S24 — UI turn-duration selector is disconnected from simulation state
**Severity: High functional integration defect.**

**Direct evidence:** the command panel maintains `turnHours` locally for 1h/3h/6h/12h/24h choices, while the demo simulation state retains its own six-hour value and `simulateTurn()` consumes the state value. No demonstrated binding transfers the UI selection into `ScenarioState` before simulation.

**Required end state:** one authoritative turn-duration value must flow from UI/session state into the canonical simulation input and be reflected in tests.

**Status:** Open — implementation not started.

#### P2-S25 — Live UI simulation bypasses the baseline/status assessment lifecycle
**Severity: Critical simulation-integrity defect.**

**Direct evidence:** the dedicated simulation-session path can call `resolveTurn(..., baseline)` and perform `assessUnit()`; the live demo calls `simulateTurn()` without a baseline. `resolveTurn()` only performs baseline-dependent assessment when a baseline is supplied. Thus the user-facing simulation path and the session simulation path do not share identical assessment/status semantics.

**Required end state:** define one canonical simulation/session path or explicitly separate the paths with equivalent documented semantics. Unit status must be derived/updated consistently from canonical results.

**Dependencies:** P2-S27/P2-S30 where resource/status commit semantics overlap.

**Status:** Open — implementation not started.

#### P2-S26 — Competing sustainment models and mutation-boundary violation
**Severity: Critical architectural defect.**

**Direct evidence:** `sustainment.ts` contains a dedicated sustainment calculation that directly mutates `UnitState`, while `engine.ts` contains separate inline fatigue/logistics/readiness/fuel behavior and does not invoke the dedicated sustainment model. The intended `resolveTurn()` → report → `applyTurn()` boundary is therefore not the sole sustainment path.

**Required end state:** determine the canonical sustainment model; make its resolution pure; have `resolveTurn()` produce sustainment effects and `applyTurn()` apply them. Remove or explicitly demote redundant legacy behavior only after consumer tracing and focused regression tests.

**Status:** Open — architecture decision required before implementation.

#### P2-S27 — Combat resource state is not demonstrated to commit to canonical personnel/equipment records
**Severity: Critical architectural/state-authority defect.**

**Direct evidence:** canonical state contains personnel/equipment records, but combat application directly subtracts personnel/equipment on `UnitState`. No demonstrated canonical personnel/equipment commit bridge was found in the audited combat path.

**Required end state:** establish the authoritative ownership model. If canonical records are authoritative, combat resolution must produce explicit resource deltas and application must commit them through canonical transitions/projections rather than silently maintaining a second resource authority.

**Dependencies:** canonical ledger/projection contracts; combat result schema; crew/equipment semantics; sustainment.

**Status:** Open — architecture decision required before implementation.

#### P2-S28 — WW2 combined-arms combat inputs are present in the API but currently hard-coded to zero
**Severity: High ruleset-completeness defect.**

**Direct evidence:** WW2 combat accepts artillery, armor, anti-armor, air support, maneuver, and command inputs, but the current `eraRules.ts` call supplies zero for each. The scenario combat implementation contains the factors, so the boundary exists but is not populated by the current runnable ruleset.

**Required end state:** define evidence-based WW2 sources/inputs and wire them through the selectable ruleset without leaking WW2 assumptions into generic core. If the product intentionally starts with zero values, document that as an explicit staged capability rather than implying the full model is active.

**Status:** Open — belongs primarily to Phase 3 after core architecture decisions are stable; do not solve by restoring WW2-specific generic-core modules.

#### P2-S29 — Engine `combatPower` calculation is not consumed by the active WW2 combat law
**Severity: High model-coherence defect.**

**Direct evidence:** the engine computes `effectiveCombatPower`, while the WW2 combat resolver independently computes quality from training, experience, readiness, morale, and cohesion and does not consume the engine's combat-power result.

**Required end state:** determine whether `combatPower` is a canonical derived combat input, a legacy aggregate to remove, or a deliberately separate metric. There must be one documented relationship rather than two competing combat-strength concepts.

**Status:** Open — architecture/model decision required; no implementation yet.

#### P2-S30 — Combat casualty application does not itself complete unit-status/state assessment
**Severity: High simulation-integrity defect.**

**Direct evidence:** combat application subtracts personnel/equipment and changes readiness but does not itself establish destroyed/disorganized state, history, or the full derived status. Status assessment exists separately and is conditional on baseline usage.

**Required end state:** define a single post-combat state transition/assessment path so casualty effects, readiness, destruction/disorganization, and history cannot diverge between simulation entry points.

**Dependencies:** P2-S25, P2-S27, unit assessment contract.

**Status:** Open.

#### P2-S31 — Logistics supply accounting has inconsistent delivered/lost semantics
**Severity: High functional defect.**

**Direct evidence:** `resolveSupply()` first reduces effective capacity by interdiction, then calculates delivered from that reduced capacity and calculates lost again as `effectiveCapacity × interdiction`. For a capacity/request of 100 and interdiction of 50%, this yields 50 delivered and 25 lost, leaving 25 units unexplained.

**Required end state:** define the physical/accounting meaning of interdiction and ensure requested = delivered + lost + explicitly documented residual/shortfall. Add boundary tests around 0%, 50%, 100%, over-capacity, and undersupply cases.

**Status:** Open — implementation not started.

#### P2-S32 — Scenario registry is not connected to the current runnable scenario set
**Severity: High integration defect.**

**Direct evidence:** the registry exposes registration/lookup/create functions but its internal registry is empty in the audited source. The demo constructs its scenario directly rather than resolving it through the registry.

**Required end state:** establish one scenario-definition/registry authority and make the live application/session path use it, or explicitly document the registry as a future API and prevent it from being mistaken for the active path. No duplicate scenario authorities.

**Status:** Open — implementation not started.

#### P2-S33 — Competing Ardennes scenario definitions exist
**Severity: High scenario-authority defect.**

**Direct evidence:** `ardenne-1944.ts` contains a prototype-style scenario with populated units/resources, while `ardenne1944.ts` defines a `ScenarioDefinition` whose initial state contains zero units. Their consumer relationship has not been proven equivalent.

**Required end state:** trace all consumers and decide which is canonical. Preserve historically useful data, migrate consumers if justified, and delete only after direct proof of zero required consumers. Do not merge by guessing.

**Status:** Open — consumer audit required before implementation.

#### P2-S34 — Map overlay is not on the actual DWST demo application path
**Severity: High integration defect.**

**Direct evidence:** `DwstMapOverlay.vue` exists and consumes the canonical GeoJSON projection, but the actual `DwstView` → `DwstDemoView` path does not render it.

**Required end state:** determine the intended host/map integration contract. If the overlay is intended for the live DWST experience, connect it through the appropriate map boundary without creating a second map authority. If it is an integration component for another host, document that ownership and test the integration separately.

**Status:** Open — architecture/integration decision required.

#### P2-S35 — Whole-system/UI test coverage does not exercise the live application path
**Severity: High validation gap.**

**Direct evidence:** core unit tests cover substantial architectural behavior, but the audited DWST UI directory does not demonstrate equivalent component/end-to-end coverage for the command panel, live simulation controls, movement command translation, map integration, or full turn lifecycle.

**Required end state:** create a validation layer that exercises the real user-facing path: scenario load → command creation → order resolution → simulation → state update → report/UI/map presentation. Tests must assert behavior, not just rendering.

**Status:** Open — validation design required. This finding should be coordinated with P2-S23 through P2-S34 rather than solved by adding superficial tests before the underlying contracts are fixed.

#### P2-S36 — Reinforcement/reconstitution/training helpers require explicit mutation-boundary classification
**Severity: Medium architectural consistency defect.**

**Direct evidence:** reinforcement, reconstitution, and training modules directly mutate their supplied state/objects, while the intended turn architecture separates pure resolution from application. Their current consumers and whether they are active simulation-path modules need to be established.

**Required end state:** classify each helper as pure calculation, explicit state transition, or legacy/inactive surface; migrate active simulation behavior to the canonical transition boundary where appropriate.

**Status:** Open — consumer audit required.

#### P2-S37 — Active simulation path and auxiliary simulation modules are not yet proven to have one behavioral contract
**Severity: High architectural/integration defect.**

**Direct evidence:** the repository contains `simulationSession.ts`, `simulationBaseline.ts`, `engine.ts`, sustainment/logistics helpers, order processing, and UI-driven simulation. The audit found differences in baseline handling and sustainment integration. The repository therefore needs an explicit contract proving which path is authoritative for a turn and which modules are supporting/legacy.

**Required end state:** one documented simulation contract with a single canonical entry path; auxiliary APIs either delegate to it or are clearly scoped as lower-level pure helpers.

**Status:** Open — architecture consolidation item.

### 3.4 Dependency-aware execution order after restructuring

The newly found issues are **not** to be fixed in discovery order. The order below prevents fixing downstream symptoms twice.

#### Stage A — Establish the canonical live simulation contract
1. **P2-S37:** define/verify the one canonical live simulation entry path and contract.
2. **P2-S25:** reconcile UI simulation with session/baseline/status semantics.
3. **P2-S24:** connect turn-duration selection to canonical simulation input.
4. **P2-S23:** fix movement-order destination/objective resolution against the canonical order contract.
5. Add focused integration tests for the live command → simulation path.

#### Stage B — Re-establish canonical state mutation/resource authority
6. **P2-S27:** resolve personnel/equipment canonical authority and combat commit semantics.
7. **P2-S30:** consolidate post-combat casualty/status assessment.
8. **P2-S26:** choose and consolidate the sustainment model while preserving the resolve/apply boundary.
9. **P2-S36:** classify and migrate active reinforcement/reconstitution/training mutations.
10. **P2-S31:** correct logistics accounting semantics and add boundary tests.

#### Stage C — Reconcile combat model/ruleset boundaries
11. **P2-S29:** resolve the relationship between `effectiveCombatPower` and WW2 combat quality.
12. **P2-S28:** complete or explicitly stage the WW2 combined-arms input model in the selectable WW2 ruleset. Do not move WW2 assumptions into generic core.

#### Stage D — Scenario and visualization integration
13. **P2-S33:** audit and reconcile the competing Ardennes definitions.
14. **P2-S32:** connect or formally scope the scenario registry.
15. **P2-S34:** establish the actual map integration boundary and live overlay path.

#### Stage E — Whole-system validation
16. **P2-S35:** build end-to-end tests around the now-canonical live path.
17. Re-run direct repository audit for duplicate state authority, duplicate simulation paths, era leakage, coordinate systems, mutation boundaries, scenario authority, and map boundaries.
18. Run CI as a gate; report running/waiting status explicitly; require completed result before closure.
19. User performs manual CI verification where requested; record the result.
20. Only after the above is clean may Phase 2 be considered for closure.

### 3.5 Authorization rule for the new findings

The findings above are **recorded, not authorized for implementation**. Each source modification must be explicitly authorized by the user. Before each implementation:

1. re-read the current source at the current branch head;
2. verify the finding still exists;
3. verify no previous fix has already addressed it;
4. identify all direct consumers and relevant tests;
5. make the minimum justified change;
6. run the relevant focused tests;
7. trigger/check CI;
8. explicitly tell the user CI is running and wait for the result;
9. independently re-inspect the architecture/source;
10. update this plan before moving to the next item.

## 4. Phase 3–15 future work relationship to the new audit

The new findings do **not** reorder or erase the original roadmap.

- **Phase 3:** P2-S28 and P2-S29 may feed WW2 combat-ruleset completion once Phase 2 establishes the generic boundaries.
- **Phase 4:** P2-S23 through P2-S25, P2-S30, P2-S32, P2-S34, and P2-S35 are prerequisites/inputs for a genuinely playable end-to-end simulation, but are being audited/fixed now where they are architectural prerequisites.
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
- 2026-08-28: Post-deletion direct inspection confirmed `movement.ts` was absent, `engine.ts` still used canonical geographic operations, and the final spatial sweep found no remaining characteristic remnants of the removed approximate implementation. The user manually confirmed the deletion CI run `remove legacy duplicate movement implementation` was green.
- 2026-08-28: P2-S21 closed for the currently evidenced repository state; future duplicate geographic-distance or antimeridian-unsafe simulation logic must be recorded as a new finding before implementation.
- 2026-08-28: Whole-system audit identified P2-S23 through P2-S37. These are recorded before implementation and are dependency-ordered to prevent downstream fixes from masking or duplicating upstream architectural corrections.
- 2026-08-28: Restructured the master plan while preserving the original long-term roadmap, historical findings, completed work, CI identifiers, architectural rules, and blueprint/audit-map distinction.
- 2026-08-28: Strengthened the plan's CI reporting protocol: when CI is running, report that it is running and wait; do not infer green from partial results; user-confirmed manual inspection may be recorded as validation evidence.

## 6. Current authoritative status

### Project roadmap
**Phase 0:** Established  
**Phase 1:** Substantially completed  
**Phase 2:** **ACTIVE — whole-system architecture/integration audit and restructuring**  
**Phase 3–15:** Future

### Refactor findings
**Closed:** P2-S7, P2-S17, P2-S18, P2-S19, P2-S20, P2-S21, P2-S22  
**Open:** P2-S23 through P2-S37  
**No new implementation is authorized merely by recording these findings.**

### Immediate next work
**Stage A, P2-S37:** establish the canonical live simulation contract and reconcile the parallel simulation/session paths before fixing downstream UI symptoms.

This is the current stopping point. The plan is now the source of truth for the next work sequence, while the older roadmap and historical record remain preserved above.

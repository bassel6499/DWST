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
10. **Blueprint discipline.** The Architectural Blueprint is a discovery and debugging index only. It maps what exists, what it does, who depends on whom, and known risks. It does not schedule implementation or override phase order. Newly discovered defects found through blueprint tracing are recorded as findings in the active master-plan phases.
11. **Roadmap separation.** The original long-term DWST roadmap and the current refactor plan are both authoritative, but serve different purposes. The long-term roadmap defines project phases and end-state scope; this document defines the currently active architectural/refactor work. Neither may silently replace the other.
12. **No duplicate work.** Before opening a new implementation item, reconcile it against completed findings, the long-term roadmap, current source, and prior CI evidence. A completed architectural correction must not be reintroduced as new work merely because its historical roadmap item remains listed.

## Long-term DWST roadmap — preserved project-level roadmap

This section preserves the original project roadmap as the forward-looking structure. It is **not** the detailed implementation checklist for the current refactor. Current refactor findings such as P2-S18–P2-S22 are subordinate implementation/audit steps and do not create a second competing project roadmap.

### Phase 0 — Rules of engagement / architectural principles
**Status: Established.** Governing architectural constraints, evidence requirements, canonical-state rules, era neutrality, and map-boundary principles are now enforced by this plan.

### Phase 1 — Foundation / canonical architecture
**Status: Substantially completed through the work leading into the current refactor.** Canonical state, scenario/turn boundaries, resource/personnel/equipment authority, and the core architectural foundation have been established; remaining defects discovered during the Phase 2 audit are tracked below rather than reopening Phase 1 generically.

### Phase 2 — Ruleset architecture + core architecture audit
**Status: Active / substantially advanced.** This is the current architectural consolidation phase. Detailed findings and verified closures are tracked in the Phase 2 section below. Do not treat this status as meaning the entire DWST project is near completion.

### Phase 3 — WW2 combat ruleset completion
**Status: Future.** Complete and validate the WW2 ruleset as a selectable era/scenario implementation after the generic core is architecturally clean. WW2 remains an era implementation, never the generic engine model.

### Phase 4 — Playable end-to-end simulation
**Status: Future.** Build/validate the complete playable simulation loop on the canonical architecture, including scenario setup, turn resolution/application, movement, detection, combat, sustainment, and reporting as required by the product scope.

### Phase 5 — ORBAT Mapper integration / visualization
**Status: Future / existing integration audited as needed.** Expand the host/map integration without creating a competing DWST map/projection system. ORBAT Mapper remains responsible for map rendering and coordinate conversion at that boundary.

### Phase 6 — Extensible era architecture
**Status: Future.** Generalize and harden the selectable-ruleset architecture so additional eras can be added without contaminating generic core mechanics.

### Phase 7 — Command / morale / higher-level behavioral systems
**Status: Future.** Add higher-level command, morale, readiness, behavior, and related simulation systems required by the product scope, while preserving canonical state and era boundaries.

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
**Status: Future.** Integrate the completed capabilities, remove justified remaining legacy surfaces, harden interfaces, and stabilize the product.

### Phase 15 — Final product state
**Status: Future end state.** DWST reaches the intended integrated, validated, extensible simulation product state.

**Roadmap interpretation rule:** the statuses above are project-level. Detailed P2 findings below may be completed, split, superseded, or added without changing the existence or order of the long-term phases. New findings must be attached to the appropriate phase rather than creating an accidental second roadmap.

## Architectural Blueprint / Audit Map

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
- Open audit: any remaining duplicate geographic distance helper or antimeridian-unsafe calculation.

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

**Known risk:** any hidden legacy entry point that bypasses this path.

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

**Current implementation:** one canonical detection pipeline remains in `detection.ts`; `DetectionPolicy` is selected through the era ruleset and passed into that pipeline rather than duplicating detection by era.

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

**Known active audit:** repository-wide legacy geographic-distance duplication and antimeridian safety.

**Resolved compatibility finding:** direct current-source inspection found no surviving `resolveWW2Engagements()` wrapper in `src/dwst/core/combat.ts`; remove it from the active-audit list unless a future source revision reintroduces it.

### G. Debugging entry guide

| Problem | Start here | Trace next |
| --- | --- | --- |
| Current location wrong | `spatialPosition.ts` | invariant → geographic operations → scenario input → map boundary |
| Movement wrong | `geographicMovement.ts` | `engine.ts` → movement tests |
| Contact/range wrong | `detection.ts` | geographic distance → selected detection policy → `combat.ts` |
| Combat wrong | `combat.ts` | selected `EraRuleset` → scenario combat module |
| Era leakage | `eraRules.ts` | core imports/callers → scenario modules |
| Unexpected mutation | `resolveTurn()` | `applyTurn()` → mutation tests |
| Personnel/equipment mismatch | canonical records | projections and crew/equipment contracts |
| Map wrong, simulation right | ORBAT Mapper boundary | `MapAdapter`/projection layer |
| Geographic anomaly | spatial map | inspect all direct consumers + legacy pattern search |
| Legacy compatibility concern | compatibility map | direct consumers → replacement → CI |

## Phase 2 — Canonical state / spatial consolidation

### Completed / verified

- Canonical `UnitState` uses `WorldPosition` (`lon`, `lat`).
- Canonical `ScenarioState` and `resolveTurn()` / `applyTurn()` establish a pure-resolution plus explicit-application boundary.
- Canonical resource state remains an aggregate/resource authority and does not replace the individual personnel registry.
- Redundant simulation-step cloning was removed and CI subsequently passed.
- The map-facing DWST path consumes canonical scenario state and geographic positions.
- `DwstMapOverlay.vue` duplicate `defineProps` declaration was removed; CI run `33100195482` passed type-check and unit tests.
- The active WW2 demo entry point was migrated from `runWW2Turn()` to the generic `simulateTurn()` path and CI run `33106939476` passed type-check and unit tests.
- The duplicate WW2 square-law implementation was consolidated into the selectable WW2 scenario layer; the old `core/ww2SquareLaw.ts` implementation was removed and CI runs `33107940693` and `33107899018` passed type-check and unit tests.
- Standalone `src/dwst/core/battlefield.ts` was removed after direct evidence showed zero current repository-search consumers for its public `BattlefieldState`, `moveUnit`, and `terrainAt` contract.
- Direct inspection confirms canonical spatial state is represented at the correct level: `UnitState.position: WorldPosition`. Spatial state does **not** belong in `CanonicalState`, which remains resource/personnel/equipment authority.
- The legacy `src/dwst/core/detection.ts` compatibility detector has been reduced to the canonical `detectContacts(ScenarioState, ...)` implementation using `WorldPosition`; the deleted battlefield-based detector is not restored.
- Legacy `src/dwst/core/simulationState.ts` has been removed after direct inspection/search established it was part of the retired operational battlefield model and had no required current consumers.
- Default generic engine coefficients are now centralized in `eraRules.ts`; the duplicate local defaults in `engine.ts` were removed.
- P2-S17 canonical geographic movement operations were added and CI validated.
- P2-S7 executable core spatial invariants were added and CI validated.
- The obsolete `src/dwst/core/ww2.ts` compatibility facade was removed after direct commit/diff inspection established that it contained only forwarding exports and the deprecated `runWW2Turn()` wrapper; its WW2 combat functionality was already owned by the selectable WW2 scenario layer and turn orchestration by the generic simulation pipeline. CI run `33117957851` passed type-check and unit tests after the subsequent WW2 fixture correction.
- P2-S18 detection geographic-distance refactor was implemented and focused regression-tested. The later green branch workflow run `33169899441` at commit `5f79471c8688cf738c3dcf6c72e1ef3dec6561b9` validated the accumulated branch state, closing the CI gate for this change without treating CI as architectural proof.
- P2-S19 minimal era-owned detection-policy boundary was implemented without duplicating the contact pipeline: `DetectionPolicy` is supplied through the selected era ruleset and consumed by canonical `detectContacts(...)`. The focused boundary tests were added in commit `5f79471c8688cf738c3dcf6c72e1ef3dec6561b9`; workflow run `33169899441` passed on that tip.
- P2-S20 direct source audit found `engagementModel.ts` and `combatArms.ts` to be unused core modules carrying WW2/industrial-era square-law assumptions. Both were removed. The later green branch workflow run `33169899441` at the current audited tip closes the CI gate for the accumulated branch state; the deletion remains architecturally justified by direct consumer evidence, not CI alone.
- Direct current-source inspection found no surviving `resolveWW2Engagements()` compatibility wrapper in `src/dwst/core/combat.ts`; it is therefore no longer an active deletion audit item on the current branch.

### Confirmed remaining architecture problems

#### P2-S18 — Detection duplicated legacy approximate geographic distance math

**Resolution:** implemented. `detection.ts` consumes canonical `geographicDistanceMeters()` rather than maintaining a latitude/longitude approximation.

**Status:** Closed. Focused regression coverage exists and later branch CI run `33169899441` passed on the audited accumulated state.

#### P2-S19 — Detection policy boundary for selectable eras

**Resolution:** implemented. The generic core retains one canonical `detectContacts(...)` loop. A minimal `DetectionPolicy` boundary is owned by the selected era ruleset and parameterizes range, sensor, intelligence, readiness, weather, terrain, and confidence behavior without duplicating detection by era.

**Status:** Closed for the currently evidenced boundary. Future era-specific requirements that cannot be represented by the policy must be added as a new finding before implementation.

#### P2-S20 — WW2-specific mechanics remained in generic core after facade removal

Direct inspection found `engagementModel.ts` and `combatArms.ts` under `src/dwst/core/` encoded WW2/industrial-era square-law formation/combat assumptions. Direct repository searches for their exported functions and module names returned no indexed consumers, and direct source inspection showed their mechanics were not part of the active selectable WW2 combat module.

**Resolution:** both unused WW2-specific core modules were removed. No generic replacement was created because no active generic contract was proven to require them.

**Status:** Closed. Accumulated branch CI is green at the audited tip.

#### P2-S21 — Repository-wide legacy geographic-distance and antimeridian audit

**Purpose:** verify that no remaining simulation-path code bypasses the canonical geographic distance/movement semantics through duplicate distance formulas, Cartesian lon/lat calculations, degree-delta approximations, or antimeridian-unsafe longitude arithmetic.

**Status:** Active audit. No implementation change is authorized merely by discovery; each confirmed defect must first be recorded with direct source evidence and then explicitly authorized before implementation.

**Audit classification:** simulation mechanics must use canonical geographic semantics; UI/rendering/projection calculations may legitimately use their own geometry when they are demonstrably outside simulation state/mechanics and remain at the appropriate host/map boundary.

#### P2-S22 — Master-plan state synchronization / roadmap separation

**Purpose:** prevent the active refactor document from drifting away from the repository or from obscuring the long-term roadmap.

**Resolution:** this document now explicitly preserves the long-term Phase 0–15 roadmap separately from the detailed Phase 2 refactor plan and states the reconciliation rules between them.

**Status:** Implemented as documentation/process control. Future material refactor changes must update the applicable detailed finding and, where relevant, the project-level phase status rather than silently replacing either layer.

### Current Phase 2 execution order

1. **P2-S21 audit:** complete the repository-wide geographic-distance/antimeridian investigation using direct source evidence.
2. Record every confirmed spatial defect before implementation; do not bundle unrelated fixes into the same item.
3. For each confirmed defect, identify all required consumers and the canonical replacement path.
4. Only after explicit authorization, implement the minimum correction and focused regression coverage.
5. Run CI as a gate and inspect the resulting source/architecture independently of CI.
6. Update this plan immediately with the actual result before opening the next implementation item.
7. After P2-S21 is closed, perform the remaining whole-project Phase 2 architecture audit for duplicate state authority, coordinate systems, era leakage, mutation boundaries, hidden compatibility consumers, and map-boundary violations.
8. Close Phase 2 only when its confirmed findings are resolved or explicitly carried into the appropriate later project phase with a documented reason.
9. Proceed to the next long-term roadmap phase only after Phase 2 closure is documented.

## Findings log

- 2026-08-27: Direct inspection confirmed canonical map path uses geographic `WorldPosition`.
- 2026-08-27: Direct inspection confirmed legacy battlefield movement/detection used `x/y`.
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
- 2026-08-27: Direct inspection confirmed the generic engine directly interpolates geographic longitude/latitude as Cartesian values; recorded as P2-S17 before correction.
- 2026-08-27: Direct inspection confirmed the host map/import-export architecture already provides GeoJSON geographic handling and ORBAT Mapper owns map conversion, so the engine correction must remain a small core geographic operation rather than a second map/projection system.
- 2026-08-28: P2-S18 closed after canonical geographic distance adoption and green accumulated branch CI.
- 2026-08-28: P2-S19 closed after implementing the minimal era-owned detection policy boundary and green accumulated branch CI.
- 2026-08-28: P2-S20 closed after direct audit/removal of unused WW2-specific core modules and green accumulated branch CI.
- 2026-08-28: P2-S21 opened for repository-wide legacy geographic-distance and antimeridian audit.
- 2026-08-28: P2-S22 established roadmap/refactor-plan separation and synchronization rules to prevent future plan drift or duplicate work.

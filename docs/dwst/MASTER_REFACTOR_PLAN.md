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

**Do not use this section to decide what gets coded next.** The phase sections below remain the authoritative coding roadmap. The blueprint may expose a new defect; when direct evidence confirms that defect, add it to the appropriate phase and continue according to phase priority.

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
  owns: selectable era-specific coefficients and combat/assessment mechanics
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
- Implemented, CI status to record: detection's duplicate approximate geographic distance.
- Open audit: any remaining duplicate geographic distance helper or antimeridian-unsafe calculation.

**Spatial investigation route:**

1. `spatialPosition.ts`
2. `spatialInvariant.ts`
3. `geographicMovement.ts`
4. direct caller (`engine.ts`, `detection.ts`, etc.)
5. scenario/import boundary
6. host map boundary
7. legacy-pattern search across the repository

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
      └── possible future detection policy
```

**Current rule:** generic orchestration stays core; historical/era-specific mechanics stay selectable.

**Known open question:** P2-S19 — whether detection needs a minimal era-owned policy boundary.

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

**Known active audit:** surviving `resolveWW2Engagements()` compatibility entry point in `combat.ts`.

### G. Debugging entry guide

| Problem | Start here | Trace next |
| --- | --- | --- |
| Current location wrong | `spatialPosition.ts` | invariant → geographic operations → scenario input → map boundary |
| Movement wrong | `geographicMovement.ts` | `engine.ts` → movement tests |
| Contact/range wrong | `detection.ts` | geographic distance → ruleset policy if present → `combat.ts` |
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

### Confirmed remaining architecture problems

#### P2-S18 — Detection duplicated legacy approximate geographic distance math

`detection.ts` still used a latitude/longitude approximation based on degree deltas, a fixed kilometers-per-degree constant, cosine scaling, and `Math.hypot`.

**Required resolution:** detection must consume the canonical `geographicDistanceMeters()` operation rather than maintain its own geographic approximation.

**Status:** Implemented; focused regression tests added. Pending/record CI result before closure.

#### P2-S19 — Detection policy is universal core logic despite selectable eras

The generic combat pipeline calls canonical `detectContacts(state)` before selected era combat, while `EraRuleset` currently has no detection policy hook.

**Status:** Confirmed architecture audit item. Do not duplicate the entire detection loop per era. First determine the smallest ruleset-owned policy boundary supported by direct evidence (for example range/confidence/environment modifiers) while retaining one canonical contact pipeline.

#### P2-S1 through P2-S17

**Status:** Previous resolved findings remain as recorded in the findings log and completed/verified sections above. Closed items are retained for traceability rather than deleted from the plan.

### Next investigation / implementation order

1. Record CI result for P2-S18; close only if green.
2. Continue direct-source legacy geographic-distance audit using the Spatial audit checklist; do not treat indexed search alone as proof of absence.
3. Inspect and resolve any remaining geographic-distance duplication or antimeridian-unsafe calculation found by direct evidence.
4. Audit the surviving `resolveWW2Engagements()` compatibility entry point in `combat.ts` for actual consumers; do not delete without direct consumer proof.
5. Determine whether P2-S19 needs a ruleset-owned detection policy/interface, and if so define the smallest boundary rather than era-duplicating the pipeline.

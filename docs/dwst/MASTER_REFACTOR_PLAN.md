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
10. **Blueprint discipline.** Every important subsystem must be traceable here: authority, inputs, outputs, dependencies, and current implementation status. When debugging a domain, start from this blueprint and inspect the listed path before inventing a new mechanism.

## Architectural Blueprint / Audit Map

**Purpose:** This is the project-level routing map for future debugging and audits. It is not a second design document. It identifies what currently exists or is intentionally planned, what each part does, and where to inspect first when a domain breaks.

### A. System authority map

```text
ORBAT Mapper / host map
  └── map rendering + UI projection + map-coordinate conversion
          │
          │ canonical geographic scenario/unit data
          ▼
DWST scenario boundary
  └── ScenarioState
      ├── era
      ├── elapsedHours / turnHours
      ├── units: UnitState[]
      ├── events
      └── scenario spatial reference contract
          │
          ▼
DWST generic core
  ├── engine / turn orchestration
  ├── detection pipeline
  ├── combat orchestration
  ├── logistics / sustainment
  ├── time progression
  ├── spatial invariants
  └── canonical resource projections
          │
          ▼
Era ruleset layer
  ├── WW2
  ├── future eras
  └── scenario-selectable combat / engine policy
          │
          ▼
Simulation report
  └── events + resulting canonical UnitState
```

### B. Spatial subsystem map

**Authority:** `UnitState.position: WorldPosition`

```text
Authoritative physical location
  UnitState.position
      │
      ▼
  WorldPosition { lon, lat }
      │
      ├── spatialInvariant.ts
      │     validates canonical current position and intent boundaries
      │
      ├── geographicMovement.ts
      │     ├── geographicDistanceMeters()
      │     └── interpolateGeographicPosition()
      │
      ├── engine.ts
      │     movement consumes geographic movement operations
      │
      ├── detection.ts
      │     contact range must consume canonical geographic distance
      │
      ├── combat.ts
      │     consumes detection/contact distance; does not create position
      │
      └── ORBAT Mapper / MapAdapter boundary
            derives map/UI coordinates only
            never becomes a second DWST physical authority
```

**Spatial audit checklist:**

1. `spatialPosition.ts` — coordinate contract and validity.
2. `spatialInvariant.ts` — canonical authority enforcement.
3. `geographicMovement.ts` — canonical distance/interpolation operations.
4. `engine.ts` — movement callers.
5. `detection.ts` — range/distance callers.
6. `combat.ts` — downstream contact-distance use.
7. scenario geometry/import/export — geographic input boundary.
8. ORBAT Mapper `MapAdapter` — UI/map conversion boundary only.
9. Search for legacy patterns: `x/y`, `111`, `Math.hypot`, raw `lon`/`lat` deltas, cosine-scaled longitude, duplicate haversine/great-circle helpers, and antimeridian-unsafe longitude differences.

### C. Turn-resolution map

```text
ScenarioState
   │
   ▼
resolveTurn()              PURE resolution
   │
   ├── movement
   ├── sustainment/logistics
   ├── readiness/fatigue/wear
   ├── detection
   └── era-owned combat
   │
   ▼
SimulationReport
   │
   ▼
applyTurn()                explicit state application
   │
   ▼
next ScenarioState
```

**Inspect:** `engine.ts`, `combat.ts`, `detection.ts`, logistics/sustainment modules, era rules, and tests.

### D. Era/ruleset map

```text
ScenarioState.era
      │
      ▼
getEraRuleset(era)
      │
      ├── engine coefficients
      ├── resolveCombat
      ├── unit assessment policy
      └── future: detection policy if direct evidence requires era variation
```

**Rule:** Generic orchestration stays core; historical/era-specific mechanics stay selectable.

### E. Resource/canonical-record map

```text
Canonical records
  ├── PersonnelRegistry
  ├── EquipmentInstance[]
  ├── InstanceCrewAssignment[]
  └── EquipmentDefinition[]
          │
          ▼
canonicalProjection.ts
  └── read-only aggregate projection
```

**Rule:** Aggregate projections are derived views, not replacement authorities.

### F. Debugging entry guide

| Problem domain | Inspect first | Then inspect |
| --- | --- | --- |
| Current location wrong | `spatialPosition.ts` | `spatialInvariant.ts` → scenario input → ORBAT boundary |
| Movement wrong | `geographicMovement.ts` | `engine.ts` → movement tests |
| Contact/range wrong | `detection.ts` | canonical geographic distance → era policy if present → `combat.ts` |
| Combat wrong | `combat.ts` | selected `EraRuleset` → scenario combat module |
| Era leaking into core | `eraRules.ts` | core imports/callers → scenario modules |
| State changes unexpectedly | `resolveTurn()` | `applyTurn()` → mutation tests |
| Personnel/equipment mismatch | canonical records | `canonicalProjection.ts` and crew/equipment contracts |
| Map looks wrong but sim state is right | ORBAT Mapper boundary | `MapAdapter` / projection layer, not a new DWST map |
| Geographic anomaly | full Spatial audit checklist | legacy pattern search + all direct distance consumers |

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
6. Identify and formalize the smallest ORBAT Mapper import/export boundary for scenario/unit geographic data; reuse existing GeoJSON/map contracts rather than adding a projection.
7. Run a final whole-project audit for duplicate state authority, coordinate systems, era leakage, mutation boundaries, geographic operations, and hidden legacy consumers.

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
- 2026-08-27: Direct inspection confirmed the generic engine directly interpolated geographic longitude/latitude as Cartesian values; corrected through deterministic great-circle movement operations and focused tests; CI validated.
- 2026-08-27: Direct inspection confirmed the host map/import-export architecture already provides GeoJSON geographic handling and ORBAT Mapper owns map conversion, so the engine correction remains a small core geographic operation rather than a second map/projection system.
- 2026-08-27: Executable core spatial invariants were added and CI validated, protecting one authoritative current physical position.
- 2026-08-27: Direct inspection confirmed `core/ww2.ts` was only a compatibility facade; commit `3efec7b3e363ab12468a31d81c697ef153792b33` removed it after the active caller had already migrated. Subsequent CI run `33117957851` passed type-check and unit tests after the WW2 fixture correction. P2-S8 is closed.
- 2026-08-27: Direct inspection found `detection.ts` retained approximate lon/lat distance arithmetic after movement had been corrected. Recorded as P2-S18 and migrated toward canonical geographic distance operations with regression tests.
- 2026-08-27: Direct inspection found era-neutral detection remains a universal core policy while combat is era-selected. Recorded as P2-S19 for a minimal policy-boundary audit rather than premature era-specific detector duplication.
- 2026-08-27: Architectural Blueprint / Audit Map added to this master plan. Future audits must use the relevant subsystem path and checklist to trace all handlers before adding replacements.

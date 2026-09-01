# DWST architecture audit

Date: 2026-08-30

## Purpose
DWST is a deterministic analytical simulation tool, not a game. Scenario content, era assumptions, historical data, and UI/map concerns must not contaminate the simulation kernel.

## Current architectural authority
- `ScenarioState` is the live projected simulation state consumed by the canonical turn engine.
- `CanonicalState` is the authoritative record-level resource state for personnel, equipment, crew assignments, equipment definitions, ammunition, and fuel.
- `canonicalSimulationSession.ts` is the live session boundary. It projects canonical resources into `ScenarioState`, resolves a turn, commits explicit resource deltas to canonical records, then projects again.
- `WorldPosition` (`{lat, lon}`) is the authoritative physical position representation in operational state and movement. No implicit x/y conversion is performed in Core.
- `ERA_RULESETS` provides era configuration. Era rules are readonly/deep-frozen shared configuration; only eras with the required implementations are runnable.
- `src/dwst/index.ts` is the supported public Core/API boundary; consumers must not become simulation authorities.
- Replay provenance is Core-owned and records model identity, ruleset fingerprint, deterministic RNG metadata, and the ordered command journal.

## Resolved findings

### 1. Competing simulation-session paths — P2-S20 CLOSED
The legacy `simulationSession.ts` path was removed and live consumers were migrated to the canonical resource-aware session. The canonical session is the operational session boundary.

### 2. Canonical resource authority — P2-S21/P2-S23 CLOSED
Personnel and equipment record-level state is authoritative, with ammunition and fuel represented in canonical consumables. Aggregate resource fields are projections. No authority-bearing `CanonicalResourceLedger`, equipment pool, or crew pool remains in the operational path.

### 3. Era ruleset mutability — P2-S24 CLOSED
Era ruleset interfaces are readonly and the shared registry/configuration is deep-frozen. Callers cannot mutate global era configuration.

### 4. Replay provenance — P2-S25 CLOSED
Canonical sessions retain Core-owned immutable provenance with model identity, deterministic ruleset fingerprint, explicit RNG metadata, and ordered command history.

### 5. Public Core boundary — P2-S26 CLOSED
The supported public entry point is `src/dwst/index.ts`. UI/adapters consume the public boundary rather than owning simulation state or importing deep Core modules as an authority.

### 6. Canonical projection validation — P2-S27 CLOSED
Missing equipment definitions and invalid/missing crew requirements are surfaced as validation errors rather than silently suppressed.

### 7. Explicit resource deltas — P2-S28 CLOSED
Resolution emits typed resource deltas when resources are consumed or combat losses are applied. The canonical session commits those deltas and does not reconstruct changes from projected before/after aggregate `UnitState` values.

### 8. Legacy spatial/state prototypes — resolved constraints
Earlier audit notes about `BattlefieldState`/`simulationState.ts` and local Cartesian distance describe historical findings, not current operational authority. `simulationState.ts` is not an operational consumer. Geographic distance in the canonical detection path uses the explicit geographic-distance operation; local map/screen coordinates remain presentation concerns.

### 9. Era capability contract — P2-S29 CLOSED
Simulation entry validates that the selected era is runnable, including the required era-owned implementations, before projecting state or beginning a turn. Unsupported scaffold eras fail at entry.

### 10. Documentation synchronization — P2-S30 CLOSED
This architecture audit and the canonical resource-accounting documentation describe the current tree and distinguish historical evidence from current operational authority. The Master Refactor Plan remains authoritative for finding status.

### 11. Canonical ownership semantics — P2-S31 CLOSED
Canonical personnel/equipment records use explicit ownership semantics for unassigned records; `unitId` is not treated as an implicit authority-bearing ownership model where another ownership state is intended.

## Non-negotiable invariants
1. Deterministic: identical inputs, state, rules, and explicit RNG state produce identical outputs.
2. No implicit replacements or inferred resource dispositions.
3. Destroyed personnel/equipment remain destroyed until an explicit auditable transition changes state.
4. Crew qualification is tied to explicit qualification/training or qualified reinforcement.
5. Scenario data cannot alter Core formulas by side effect.
6. Historical claims require provenance; the engine does not invent OOB data.
7. UI/map rendering is presentation and cannot modify simulation mathematics.
8. External map/ORBAT services are adapters, not combat-resolution authorities.
9. Formula parameters used in resolution are inspectable through the applicable ruleset/configuration.
10. AAR calculations are reproducible from saved initial state plus ordered command provenance.
11. Resource accounting changes are explicit deltas/events applied at an authoritative commit boundary.

## Refactor sequence
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

## Status discipline
The master refactor plan is authoritative for finding status. This document explains the architecture and evidence context; it must not be used to override the plan or declare a finding closed without repository and CI evidence.

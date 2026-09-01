# P2-S14 — Legacy simulation state dependency

Direct inspection after removal of `src/dwst/core/battlefield.ts` found `src/dwst/core/simulationState.ts` still importing and storing the deleted `BattlefieldState`. Its `createSimulationState()` constructor and `advanceClock()` therefore belong to the retired legacy operational model.

Direct repository searches found no current consumers for `simulationState`, `SimulationState`, or `createSimulationState` on `audit/canonical-state-refactor`.

Decision: remove the dead legacy simulation-state module rather than reintroducing a battlefield dependency. Canonical runtime state remains `ScenarioState`, with `UnitState.position: WorldPosition`; resource authority remains `CanonicalState`.

This finding is recorded before deletion under the governing rule that every confirmed architectural defect is added to the master plan before action.

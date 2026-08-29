import type { CanonicalState } from './canonicalState';
import { allocateCombatLosses, type CombatAllocationPolicy } from './canonicalCombatAllocation';
import { commitCombatResourceChanges } from './canonicalCombatCommit';
import { commitCanonicalConsumableState } from './canonicalConsumables';
import { reconcileScenarioResourceAggregates } from './canonicalScenarioProjection';
import type { ScenarioState, SimulationReport } from './types';
import { getEraRuleset, type EraRuleset } from './eraRules';
import { applyTurn, resolveTurn } from './engine';
import { captureSimulationBaseline, type SimulationBaseline } from './simulationBaseline';

export interface CanonicalSimulationSession {
  readonly state: ScenarioState;
  readonly canonical: CanonicalState;
  readonly baseline: SimulationBaseline;
  readonly rules: EraRuleset;
}

export interface CanonicalSimulationSessionStepResult {
  readonly session: CanonicalSimulationSession;
  readonly report: SimulationReport;
}

const cloneScenario = (state: ScenarioState): ScenarioState => ({
  ...state,
  units: Object.fromEntries(Object.entries(state.units).map(([id, unit]) => [id, {
    ...unit,
    position: { ...unit.position },
    order: unit.order ? { ...unit.order, destination: unit.order.destination ? { ...unit.order.destination } : undefined } : undefined,
    history: unit.history.map((event) => ({ ...event })),
  }])),
  locations: state.locations?.map((location) => ({ ...location, position: { ...location.position } })),
  events: state.events.map((event) => ({ ...event, unitIds: [...event.unitIds] })),
});

const cloneCanonical = (state: CanonicalState): CanonicalState => ({
  personnel: {
    personnel: state.personnel.personnel.map((record) => ({
      ...record,
      qualifications: [...record.qualifications],
      experience: { ...record.experience },
    })),
  },
  equipment: state.equipment.map((instance) => ({ ...instance })),
  crewAssignments: state.crewAssignments.map((assignment) => ({ ...assignment })),
  equipmentDefinitions: state.equipmentDefinitions.map((definition) => ({ ...definition })),
  consumables: state.consumables.map((record) => ({ ...record })),
});

/** Start the canonical simulation path with explicit authoritative resources. */
export function startCanonicalSimulation(
  state: ScenarioState,
  canonical: CanonicalState,
  rules: EraRuleset = getEraRuleset(state.era),
): CanonicalSimulationSession {
  if (!rules) throw new Error('No ruleset selected');
  const projectedState = reconcileScenarioResourceAggregates(state, canonical);
  return {
    state: cloneScenario(projectedState),
    canonical: cloneCanonical(canonical),
    baseline: captureSimulationBaseline(projectedState),
    rules,
  };
}

/**
 * Advance one live turn using canonical resource authority.
 * Resolution stays pure; losses are explicitly allocated and committed to
 * canonical records, while ammunition/fuel are committed as typed canonical
 * consumable records before the next state is projected.
 */
export function advanceCanonicalSimulation(
  session: CanonicalSimulationSession,
  policy: CombatAllocationPolicy,
): CanonicalSimulationSessionStepResult {
  const working = cloneScenario(reconcileScenarioResourceAggregates(session.state, session.canonical));
  const before = working.units;
  const report = resolveTurn(working, session.rules, session.baseline);
  let canonical = cloneCanonical(session.canonical);

  for (const nextUnit of report.units) {
    const previousUnit = before[nextUnit.id];
    if (!previousUnit) throw new Error(`Simulation report contains unknown unit ${nextUnit.id}`);

    const personnelLosses = previousUnit.personnel - nextUnit.personnel;
    const equipmentLosses = previousUnit.equipment - nextUnit.equipment;
    if (personnelLosses < 0 || equipmentLosses < 0) {
      throw new Error(`Canonical resource reconciliation cannot commit resource increases for unit ${nextUnit.id}`);
    }
    if (personnelLosses > 0 || equipmentLosses > 0) {
      const commit = allocateCombatLosses(canonical, nextUnit.id, {
        personnel: personnelLosses,
        equipment: equipmentLosses,
      }, policy);
      canonical = commitCombatResourceChanges(canonical, commit);
    }

    const previousConsumables = canonical.consumables.find((record) => record.unitId === nextUnit.id);
    if (!previousConsumables) throw new Error(`Missing canonical consumable coverage for unit ${nextUnit.id}`);
    canonical = {
      ...canonical,
      consumables: commitCanonicalConsumableState(canonical.consumables, {
        unitId: nextUnit.id,
        ammunition: nextUnit.ammunition,
        fuel: nextUnit.fuel,
      }),
    };
  }

  const nextState = reconcileScenarioResourceAggregates(applyTurn(working, report), canonical);
  return {
    session: { state: nextState, canonical, baseline: session.baseline, rules: session.rules },
    report,
  };
}
import type { CanonicalState } from './canonicalState';
import { allocateCombatLosses, type CombatAllocationPolicy } from './canonicalCombatAllocation';
import { commitCombatResourceChanges } from './canonicalCombatCommit';
import { commitCanonicalConsumableDelta } from './canonicalConsumables';
import { reconcileScenarioResourceAggregates } from './canonicalScenarioProjection';
import type { Order, ScenarioState, SimulationReport } from './types';
import { getEraRuleset, type EraRuleset } from './eraRules';
import { applyTurn, resolveTurn } from './engine';
import { captureSimulationBaseline, type SimulationBaseline } from './simulationBaseline';
import { appendReplayCommands, createReplayProvenance, type ReplayProvenance } from './replayProvenance';

export interface CanonicalSimulationSession {
  readonly state: ScenarioState;
  readonly canonical: CanonicalState;
  readonly baseline: SimulationBaseline;
  readonly rules: EraRuleset;
  readonly provenance: ReplayProvenance;
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

const ordersForUnits = (state: ScenarioState): Readonly<Record<string, Order | undefined>> =>
  Object.fromEntries(Object.entries(state.units).map(([id, unit]) => [id, unit.order]));

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
    provenance: createReplayProvenance(rules),
  };
}

/**
 * Advance one live turn using canonical resource authority.
 * Resolution produces explicit typed resource deltas; canonical records are
 * then updated from those deltas before the next projection.
 */
export function advanceCanonicalSimulation(
  session: CanonicalSimulationSession,
  policy: CombatAllocationPolicy,
): CanonicalSimulationSessionStepResult {
  const working = cloneScenario(reconcileScenarioResourceAggregates(session.state, session.canonical));
  const report = resolveTurn(working, session.rules, session.baseline);
  let canonical = cloneCanonical(session.canonical);

  for (const delta of report.resourceDeltas) {
    if (delta.personnel > 0 || delta.equipment > 0) {
      throw new Error(`Canonical resource reconciliation cannot commit resource increases for unit ${delta.unitId}`);
    }
    const personnelLosses = -delta.personnel;
    const equipmentLosses = -delta.equipment;
    if (personnelLosses > 0 || equipmentLosses > 0) {
      const commit = allocateCombatLosses(canonical, delta.unitId, {
        personnel: personnelLosses,
        equipment: equipmentLosses,
      }, policy);
      canonical = commitCombatResourceChanges(canonical, commit);
    }
    canonical = {
      ...canonical,
      consumables: commitCanonicalConsumableDelta(canonical.consumables, delta),
    };
  }

  const nextState = reconcileScenarioResourceAggregates(applyTurn(working, report), canonical);
  const provenance = appendReplayCommands(session.provenance, session.rules, report.turn, ordersForUnits(working));
  return {
    session: { state: nextState, canonical, baseline: session.baseline, rules: session.rules, provenance },
    report,
  };
}

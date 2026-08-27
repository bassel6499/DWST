import type { ScenarioState, SimulationReport } from './types';
import { getEraRuleset, type EraRuleset } from './eraRules';
import { applyTurn, resolveTurn } from './engine';
import { captureSimulationBaseline, type SimulationBaseline } from './simulationBaseline';

export interface SimulationSession {
  readonly state: ScenarioState;
  readonly baseline: SimulationBaseline;
  readonly rules: EraRuleset;
}

export interface SimulationSessionStepResult {
  readonly session: SimulationSession;
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
  events: state.events.map((event) => ({ ...event, unitIds: [...event.unitIds] })),
});

/** Start a simulation and capture its immutable T0 personnel baseline exactly once. */
export function startSimulation(state: ScenarioState, rules: EraRuleset = getEraRuleset(state.era)): SimulationSession {
  if (!rules) throw new Error('No ruleset selected');
  return { state: cloneScenario(state), baseline: captureSimulationBaseline(state), rules };
}

/** Advance an existing simulation session while preserving its original T0 baseline. */
export function advanceSimulation(session: SimulationSession): SimulationSessionStepResult {
  const working = cloneScenario(session.state);
  const report = resolveTurn(working, session.rules, session.baseline);
  const nextState = applyTurn(working, report);
  return {
    session: { state: nextState, baseline: session.baseline, rules: session.rules },
    report,
  };
}

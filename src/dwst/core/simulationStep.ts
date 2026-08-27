import type { ScenarioState, SimulationReport } from './types';
import { getEraRuleset, type EraRuleset } from './eraRules';
import { applyTurn, resolveTurn } from './engine';

export interface SimulationStepResult {
  state: ScenarioState;
  report: SimulationReport;
}

/**
 * Pure boundary for one simulation turn.
 *
 * Resolution operates on an isolated clone. The returned state is the
 * explicit application of that report to the cloned scenario, while the
 * supplied input remains unchanged.
 */
export function simulateTurn(state: ScenarioState, rules: EraRuleset = getEraRuleset(state.era)): SimulationStepResult {
  if (!rules) throw new Error('No ruleset selected');

  const working: ScenarioState = {
    ...state,
    units: Object.fromEntries(Object.entries(state.units).map(([id, unit]) => [id, {
      ...unit,
      position: { ...unit.position },
      order: unit.order ? { ...unit.order, destination: unit.order.destination ? { ...unit.order.destination } : undefined } : undefined,
      history: unit.history.map(event => ({ ...event })),
    }])),
    events: state.events.map(event => ({ ...event, unitIds: [...event.unitIds] })),
  };

  const report = resolveTurn(working, rules);
  const nextState = applyTurn(working, report);
  return { state: nextState, report };
}

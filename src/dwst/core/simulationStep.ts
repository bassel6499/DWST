import type { ScenarioState, SimulationReport } from './types';
import { getEraRuleset, type EraRuleset } from './eraRules';
import { resolveTurn } from './engine';

export interface SimulationStepResult {
  state: ScenarioState;
  report: SimulationReport;
}

/**
 * Pure boundary for one simulation turn.
 *
 * The existing engine resolver remains the compatibility implementation; this
 * API isolates it behind a cloned state so callers receive a new authoritative
 * state and the supplied input is never mutated.
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
  return { state: working, report };
}

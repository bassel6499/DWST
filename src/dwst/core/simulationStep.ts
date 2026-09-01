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
 * The canonical engine owns isolation during resolution and the explicit
 * application step produces the next state. The supplied input remains
 * unchanged.
 */
export function simulateTurn(state: ScenarioState, rules: EraRuleset = getEraRuleset(state.era)): SimulationStepResult {
  if (!rules) throw new Error('No ruleset selected');

  const report = resolveTurn(state, rules);
  const nextState = applyTurn(state, report);
  return { state: nextState, report };
}

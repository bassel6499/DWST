/**
 * Compatibility exports for the former core WW2 module.
 *
 * WW2 mechanics belong to the selectable WW2 scenario/ruleset, while turn
 * orchestration belongs to the era-neutral simulation pipeline.
 */
export type { WW2CombatInput, WW2CombatResult } from '../scenarios/ww2/combat';
export { resolveWW2Combat } from '../scenarios/ww2/combat';

import type { ScenarioState, SimulationReport } from './types';
import { simulateTurn } from './simulationStep';

/**
 * @deprecated Use simulateTurn(state). The generic simulation pipeline selects
 * the era ruleset from state.era and must remain the sole turn orchestrator.
 */
export function runWW2Turn(state: ScenarioState): SimulationReport {
  return simulateTurn(state);
}

import type { UnitState } from '../../core/types';
import type { WW2GeometryFactors } from './combatGeometry';
import type { WW2EffectivenessFactors } from './combatResolution';
import type { WW2CombatEffects } from './combatEffects';
import type { WW2CombatInput, WW2CombatOutcome } from './combat';
import { WW2_COMBAT_COEFFICIENTS as C } from './combatCoefficients';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);

export interface WW2TacticalResult {
  readonly outcome: WW2CombatOutcome;
  readonly localRatio: number;
  readonly attackerAdvanceKm: number;
  readonly defenderWithdrawalKm: number;
  readonly defenderReserveCommitted: boolean;
  readonly attackerReserveCommitted: boolean;
}

function reserveFraction(unit: UnitState) {
  return clamp(unit.reserveFraction ?? (unit.order?.type === 'reserve' ? C.reserveOrderFraction : C.reserveDefaultFraction));
}

/** Turns combat superiority into a bounded tactical state transition request. */
export function determineTacticalOutcome(
  input: WW2CombatInput,
  effectiveness: WW2EffectivenessFactors,
  effects: WW2CombatEffects,
  _geometry: WW2GeometryFactors,
): WW2TacticalResult {
  const attackerScore =
    effectiveness.alpha * positive(input.attacker.personnel) *
    (1 - effects.attackerSuppressionDelta) *
    (1 - effects.attackerDisorganizationDelta) *
    (0.65 + 0.35 * effectiveness.attackerMobility);
  const defenderScore =
    effectiveness.beta * positive(input.defender.personnel) *
    (1 - effects.defenderSuppressionDelta) *
    (1 - effects.defenderDisorganizationDelta) *
    (0.65 + 0.35 * effectiveness.defenderMobility) *
    effectiveness.terrain;
  const localRatio = attackerScore / Math.max(defenderScore, 1e-9);
  const attackerCanExploit =
    effectiveness.attackerMobility > effectiveness.defenderMobility + C.outcomeExploitMobilityGap &&
    effectiveness.maneuver > -0.05 && effectiveness.command > -0.20;
  const defenderReserve = reserveFraction(input.defender);
  const attackerReserve = reserveFraction(input.attacker);
  const defenderResponse = clamp(0.50 + 0.50 * input.defender.commandQuality);
  let outcome: WW2CombatOutcome = 'local_gain';

  if (input.defender.order?.type === 'withdraw' || effects.defenderDisorganizationDelta >= C.outcomeWithdrawalDisorganization) {
    outcome = 'defender_withdraws';
  } else if (localRatio < C.outcomeRepulsed) {
    outcome = 'attacker_repulsed';
  } else if (localRatio < C.outcomeStall) {
    outcome = 'attacker_stalls';
  } else if (attackerCanExploit && localRatio >= C.outcomeBreakthrough && effects.defenderDisorganizationDelta >= C.outcomeBreakthroughDisorganization) {
    outcome = 'breakthrough';
  } else if (attackerCanExploit && localRatio >= C.outcomePenetration && effects.defenderDisorganizationDelta >= C.outcomePenetrationDisorganization) {
    outcome = 'penetration';
  }

  const isBreakIn = outcome === 'penetration' || outcome === 'breakthrough';
  const defenderReserveCommitted = isBreakIn && defenderReserve > 0.05 && defenderResponse >= 0.70 && effectiveness.reactionDelayHours < 6;
  const attackerReserveCommitted = isBreakIn && attackerReserve > 0.05;
  if (defenderReserveCommitted && outcome === 'penetration' && effectiveness.defenderMobility >= effectiveness.attackerMobility) outcome = 'attacker_stalls';

  return {
    outcome,
    localRatio,
    attackerAdvanceKm: outcome === 'breakthrough' ? C.movementBreakthroughKm : outcome === 'penetration' ? C.movementPenetrationKm : outcome === 'local_gain' ? C.movementLocalGainKm : 0,
    defenderWithdrawalKm: outcome === 'defender_withdraws' ? C.movementWithdrawalKm : outcome === 'breakthrough' ? C.movementCounterattackKm : 0,
    defenderReserveCommitted,
    attackerReserveCommitted,
  };
}

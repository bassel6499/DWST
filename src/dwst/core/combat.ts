import type { ScenarioState } from './types';
import { getEraRuleset } from './eraRules';
import { detectContacts } from './detection';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export interface Engagement {
  attackerId: string;
  defenderId: string;
  distanceKm: number;
  detectedByAttacker: boolean;
  attackerLosses: number;
  defenderLosses: number;
  attackerEquipmentLosses: number;
  defenderEquipmentLosses: number;
  result: string;
}

/**
 * Resolve engagements through the single era-owned combat ruleset.
 *
 * This function is deliberately read-only with respect to the supplied
 * ScenarioState. Combat resolution produces observations/results; committing
 * those results belongs to the turn-application boundary.
 */
export function resolveEngagements(state: ScenarioState): Engagement[] {
  const era = getEraRuleset(state.era);
  if (!era.implemented || !era.resolveCombat) {
    throw new Error(`Era ${state.era} does not have a runnable combat implementation`);
  }

  const contacts = detectContacts(state, state.sensors ?? [], era.detection);
  const engagements: Engagement[] = [];
  const seen = new Set<string>();

  for (const c of contacts) {
    if (!c.detected) continue;
    const attackerCandidate = state.units[c.observerId];
    const defender = state.units[c.targetId];
    if (!attackerCandidate || !defender) continue;

    const attacker = attackerCandidate.order?.type === 'attack' ? attackerCandidate : null;
    if (!attacker || attacker.side === defender.side || defender.status === 'destroyed') continue;

    const key = [attacker.id, defender.id].sort().join(':');
    if (seen.has(key)) continue;
    seen.add(key);

    const result = era.resolveCombat({
      attacker,
      defender,
      state,
      surprise: clamp(attacker.intelligence - defender.intelligence, -0.5, 0.5),
    });

    engagements.push({
      attackerId: attacker.id,
      defenderId: defender.id,
      distanceKm: c.distanceKm,
      detectedByAttacker: true,
      attackerLosses: result.attackerLosses,
      defenderLosses: result.defenderLosses,
      attackerEquipmentLosses: result.attackerEquipmentLosses,
      defenderEquipmentLosses: result.defenderEquipmentLosses,
      result: `${attacker.name}: -${result.attackerLosses} personnel; ${defender.name}: -${result.defenderLosses} personnel.`,
    });
  }

  return engagements;
}
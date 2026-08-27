import type { ScenarioState, UnitState } from './types';
import { resolveWW2SquareLaw } from './ww2SquareLaw';

export interface CombatRuleset {
  id: string;
  label: string;
  resolveCombat(input: {
    attacker: UnitState;
    defender: UnitState;
    state: ScenarioState;
    surprise: number;
  }): {
    attackerLosses: number;
    defenderLosses: number;
    attackerEquipmentLosses: number;
    defenderEquipmentLosses: number;
  };
}

/** First complete era implementation. WWII-specific mathematics stays here. */
export const WWII_RULESET: CombatRuleset = {
  id: 'ww2',
  label: 'World War II',
  resolveCombat: ({ attacker, defender, state, surprise }) => {
    const result = resolveWW2SquareLaw({
      attacker,
      defender,
      terrainDefense: state.terrain,
      weather: state.weather,
      surprise,
      artillerySupport: 0,
      armorSupport: 0,
      antiArmor: 0,
      airSupport: 0,
      maneuver: 0,
      command: 0,
    });
    return {
      attackerLosses: result.attackerLosses,
      defenderLosses: result.defenderLosses,
      attackerEquipmentLosses: result.attackerEquipmentLosses,
      defenderEquipmentLosses: result.defenderEquipmentLosses,
    };
  },
};

const RULESETS: Record<string, CombatRuleset> = { ww2: WWII_RULESET };

export function getCombatRuleset(id: string): CombatRuleset | undefined {
  return RULESETS[id];
}

export function requireCombatRuleset(id: string): CombatRuleset {
  const ruleset = getCombatRuleset(id);
  if (!ruleset) throw new Error(`No combat ruleset is registered for era: ${id}`);
  return ruleset;
}

export function listCombatRulesets(): CombatRuleset[] {
  return Object.values(RULESETS);
}

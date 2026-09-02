import type { WW2ForceCapability } from './combatCapability';
import type { WW2CombatInput } from './combat';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);

export interface WW2TargetInteraction {
  readonly artilleryTargetA: number;
  readonly artilleryTargetB: number;
  readonly armorTargetA: number;
  readonly armorTargetB: number;
  readonly targetArmorA: number;
  readonly targetArmorB: number;
  readonly infantryTargetA: number;
  readonly infantryTargetB: number;
  readonly directFireA: number;
  readonly directFireB: number;
}

/**
 * Target interaction remains deliberately category-level until scenario data
 * supplies weapon-level definitions. This prevents a fake database of WW2
 * weapon coefficients while making target dependence explicit.
 */
export function calculateTargetInteraction(
  input: WW2CombatInput,
  attacker: WW2ForceCapability,
  defender: WW2ForceCapability,
): WW2TargetInteraction {
  const range = Math.max(0, input.distanceKm ?? 0);
  const directRange = Math.exp(-range / 6);
  const antiArmorA = positive(input.antiArmor ?? attacker.antiArmor * 0.80);
  const antiArmorB = defender.antiArmor * 0.80;
  const armorA = positive(input.armorSupport ?? attacker.armor * 0.60);
  const armorB = defender.armor * 0.60;
  const artilleryA = attacker.artillery * 0.75;
  const artilleryB = defender.artillery * 0.75;
  const defenderArmor = clamp(defender.armor);
  const attackerArmor = clamp(attacker.armor);
  const defenderInfantry = clamp(defender.infantry);
  const attackerInfantry = clamp(attacker.infantry);
  return {
    targetArmorA: defenderArmor > 0 ? 1 + antiArmorA * (0.65 + 0.35 * defenderArmor) : 1 + 0.25 * antiArmorA,
    targetArmorB: attackerArmor > 0 ? 1 + antiArmorB * (0.65 + 0.35 * attackerArmor) : 1 + 0.25 * antiArmorB,
    armorTargetA: defenderArmor > 0 ? 1 + armorA * (0.35 + 0.65 * (1 - defender.antiArmor)) : 1 + armorA * 0.75,
    armorTargetB: attackerArmor > 0 ? 1 + armorB * (0.35 + 0.65 * (1 - attacker.antiArmor)) : 1 + armorB * 0.75,
    artilleryTargetA: defenderArmor > 0 ? 0.75 + 0.25 * (1 - defenderArmor) : 1,
    artilleryTargetB: attackerArmor > 0 ? 0.75 + 0.25 * (1 - attackerArmor) : 1,
    infantryTargetA: 0.85 + 0.15 * defenderInfantry,
    infantryTargetB: 0.85 + 0.15 * attackerInfantry,
    directFireA: clamp(directRange * (0.65 + 0.35 * (1 - defender.armor))),
    directFireB: clamp(directRange * (0.65 + 0.35 * (1 - attacker.armor))),
  };
}

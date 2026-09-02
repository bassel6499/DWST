import type { WW2CombatInput, WW2EffectivenessFactors } from './combatTypes';
import type { WW2ForceCapability } from './combatCapability';
import type { WW2AttritionResult } from './combatAttrition';
import { WW2_COMBAT_COEFFICIENTS as C } from './combatCoefficients';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);
const ratio = (n: number, d: number, empty = 0) => d > 0 ? clamp(n / d) : empty;

export interface WW2CombatEffects {
  readonly attackerEquipmentLosses: number; readonly defenderEquipmentLosses: number;
  readonly attackerAmmunitionDelta: number; readonly defenderAmmunitionDelta: number;
  readonly attackerFuelDelta: number; readonly defenderFuelDelta: number;
  readonly attackerReadinessDelta: number; readonly defenderReadinessDelta: number;
  readonly attackerMoraleDelta: number; readonly defenderMoraleDelta: number;
  readonly attackerSuppressionDelta: number; readonly defenderSuppressionDelta: number;
  readonly attackerDisorganizationDelta: number; readonly defenderDisorganizationDelta: number;
  readonly attackerEffectiveness: number; readonly defenderEffectiveness: number;
  readonly lossRateA: number; readonly lossRateB: number;
}

/** Converts resolved fire into persistent casualties, condition and resource deltas. */
export function calculateEffects(input: WW2CombatInput, capabilityA: WW2ForceCapability, capabilityB: WW2ForceCapability, effectiveness: WW2EffectivenessFactors, attrition: WW2AttritionResult): WW2CombatEffects {
  const lossRateA = ratio(attrition.attackerLosses, positive(input.attacker.personnel));
  const lossRateB = ratio(attrition.defenderLosses, positive(input.defender.personnel));
  const attackerEquipmentLosses = Math.min(input.attacker.equipment, Math.round(input.attacker.equipment * (C.equipmentLossBase + C.equipmentLossPersonnelWeight * lossRateA) * (C.equipmentLossCapabilityMin + (1 - C.equipmentLossCapabilityMin) * effectiveness.attackerEquipment) * (1 + capabilityA.armor * 0.48)));
  const defenderEquipmentLosses = Math.min(input.defender.equipment, Math.round(input.defender.equipment * (C.equipmentLossBase + C.equipmentLossPersonnelWeight * lossRateB) * (C.equipmentLossCapabilityMin + (1 - C.equipmentLossCapabilityMin) * effectiveness.defenderEquipment) * (1 + capabilityB.armor * 0.48)));
  const fireA = clamp(input.attacker.ammunition * (0.20 + 0.45 * capabilityA.artillery + 0.25 * capabilityA.air + 0.10 * capabilityA.armor));
  const fireB = clamp(input.defender.ammunition * (0.20 + 0.45 * capabilityB.artillery + 0.25 * capabilityB.air + 0.10 * capabilityB.armor));
  const intensityA = clamp(input.attacker.ammunition * (0.25 + 0.45 * lossRateA + 0.15 * capabilityA.artillery + 0.10 * capabilityA.air + 0.10 * Math.abs(effectiveness.maneuver)));
  const intensityB = clamp(input.defender.ammunition * (0.25 + 0.45 * lossRateB + 0.15 * capabilityB.artillery + 0.10 * capabilityB.air));
  const attackerSuppressionDelta = clamp(C.suppressionBase + C.suppressionFireWeight * fireB + C.suppressionLossWeight * lossRateB + C.suppressionArtilleryWeight * capabilityB.artillery + 0.05 * Math.max(-effectiveness.surprise, 0));
  const defenderSuppressionDelta = clamp(C.suppressionBase + C.suppressionFireWeight * fireA + C.suppressionLossWeight * lossRateA + C.suppressionArtilleryWeight * capabilityA.artillery + 0.05 * Math.max(effectiveness.surprise, 0));
  const attackerDisorganizationDelta = clamp(C.disorganizationBase + C.disorganizationSuppressionWeight * attackerSuppressionDelta + C.disorganizationLossWeight * lossRateA + C.disorganizationCommandWeight * Math.max(-effectiveness.command, 0));
  const defenderDisorganizationDelta = clamp(C.disorganizationBase + C.disorganizationSuppressionWeight * defenderSuppressionDelta + C.disorganizationLossWeight * lossRateB + C.disorganizationCommandWeight * Math.max(effectiveness.command, 0));
  return {
    attackerEquipmentLosses, defenderEquipmentLosses,
    attackerAmmunitionDelta: -Math.min(input.attacker.ammunition, C.ammunitionBaseUse + C.ammunitionIntensityWeight * intensityA + C.ammunitionArtilleryWeight * capabilityA.artillery + C.ammunitionAirWeight * capabilityA.air),
    defenderAmmunitionDelta: -Math.min(input.defender.ammunition, C.ammunitionBaseUse + C.ammunitionIntensityWeight * intensityB + C.ammunitionArtilleryWeight * capabilityB.artillery + C.ammunitionAirWeight * capabilityB.air),
    attackerFuelDelta: -Math.min(input.attacker.fuel, C.fuelBaseUse + C.fuelIntensityWeight * intensityA + C.fuelArmorWeight * capabilityA.armor + C.fuelManeuverWeight * Math.max(effectiveness.maneuver, 0)),
    defenderFuelDelta: -Math.min(input.defender.fuel, C.fuelBaseUse + C.fuelIntensityWeight * intensityB + C.fuelArmorWeight * capabilityB.armor),
    attackerReadinessDelta: -clamp(C.readinessBaseLoss + C.readinessPersonnelLossWeight * lossRateA + C.readinessIntensityWeight * intensityA + C.readinessSuppressionWeight * attackerSuppressionDelta, 0, 0.30),
    defenderReadinessDelta: -clamp(C.readinessBaseLoss + C.readinessPersonnelLossWeight * lossRateB + C.readinessIntensityWeight * intensityB + C.readinessSuppressionWeight * defenderSuppressionDelta, 0, 0.30),
    attackerMoraleDelta: -clamp(C.moraleBaseLoss + C.moralePersonnelLossWeight * lossRateA + C.moraleIntensityWeight * intensityA + C.moraleSurpriseWeight * Math.max(-effectiveness.surprise, 0), 0, 0.25),
    defenderMoraleDelta: -clamp(C.moraleBaseLoss + C.moralePersonnelLossWeight * lossRateB + C.moraleIntensityWeight * intensityB + C.moraleSurpriseWeight * Math.max(effectiveness.surprise, 0), 0, 0.25),
    attackerSuppressionDelta, defenderSuppressionDelta, attackerDisorganizationDelta, defenderDisorganizationDelta,
    attackerEffectiveness: 1 - Math.exp(-effectiveness.alpha * positive(input.attacker.personnel) ** 2 / Math.max(positive(input.defender.personnel), 1)),
    defenderEffectiveness: 1 - Math.exp(-effectiveness.beta * positive(input.defender.personnel) ** 2 / Math.max(positive(input.attacker.personnel), 1)),
    lossRateA, lossRateB,
  };
}

import type { UnitState } from '../../core/types';

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export interface WW2CombatInput {
  attacker: UnitState;
  defender: UnitState;
  terrainDefense: number;
  weather: number;
  surprise: number;
  artillerySupport: number;
}

export interface WW2CombatResult {
  attackerLosses: number;
  defenderLosses: number;
  attackerEquipmentLosses: number;
  defenderEquipmentLosses: number;
  attackerEffectiveness: number;
  defenderEffectiveness: number;
}

export function resolveWW2Combat(input: WW2CombatInput): WW2CombatResult {
  const { attacker, defender } = input;
  const terrainDefense = clamp(input.terrainDefense, 0.5, 1.5);
  const weather = clamp(input.weather);
  const surprise = clamp(input.surprise);
  const attackerQuality = 0.30 * clamp(attacker.training) + 0.20 * clamp(attacker.experience) + 0.20 * clamp(attacker.readiness) + 0.15 * clamp(attacker.morale) + 0.15 * clamp(attacker.cohesion);
  const defenderQuality = 0.30 * clamp(defender.training) + 0.20 * clamp(defender.experience) + 0.20 * clamp(defender.readiness) + 0.15 * clamp(defender.morale) + 0.15 * clamp(defender.cohesion);
  const attackerFire = Math.max(1, attacker.personnel * (0.65 + 0.35 * attackerQuality) * (0.5 + 0.5 * clamp(attacker.ammunition)));
  const defenderFire = Math.max(1, defender.personnel * (0.65 + 0.35 * defenderQuality) * (0.5 + 0.5 * clamp(defender.ammunition)));
  const attackPower = attackerFire * (0.75 + 0.25 * weather) * (1 + input.artillerySupport) * (1 + surprise);
  const defensePower = defenderFire * terrainDefense * (0.75 + 0.25 * weather) * (1 - 0.5 * surprise);
  const attackerRate = 0.012 * (defensePower / Math.max(attackerFire, 1));
  const defenderRate = 0.012 * (attackPower / Math.max(defenderFire, 1));
  return {
    attackerLosses: Math.min(attacker.personnel, Math.round(attacker.personnel * clamp(attackerRate))),
    defenderLosses: Math.min(defender.personnel, Math.round(defender.personnel * clamp(defenderRate))),
    attackerEquipmentLosses: Math.min(attacker.equipment, Math.round(attacker.equipment * clamp(attackerRate * 0.35))),
    defenderEquipmentLosses: Math.min(defender.equipment, Math.round(defender.equipment * clamp(defenderRate * 0.35))),
    attackerEffectiveness: clamp(attackPower / Math.max(defensePower, 1)),
    defenderEffectiveness: clamp(defensePower / Math.max(attackPower, 1)),
  };
}

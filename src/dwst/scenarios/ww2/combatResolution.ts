import type { UnitState } from '../../core/types';
import type { WW2ForceCapability, WW2ForceQuality } from './combatCapability';
import type { WW2GeometryFactors } from './combatGeometry';
import type { WW2TargetInteraction } from './combatTargetInteraction';
import type { WW2CombatInput, WW2CombatPhase, WW2EffectivenessFactors } from './combatTypes';
import { WW2_COMBAT_COEFFICIENTS as C } from './combatCoefficients';
import { resolveAttrition, type WW2AttritionResult } from './combatAttrition';
import { calculateEffects, type WW2CombatEffects } from './combatEffects';
import { determineTacticalOutcome, type WW2TacticalResult } from './combatOutcome';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export type { WW2AttritionResult, WW2CombatEffects, WW2TacticalResult, WW2EffectivenessFactors };
export { resolveAttrition, calculateEffects, determineTacticalOutcome };

function posture(unit: UnitState, defender: boolean) {
  if (defender) {
    if (unit.order?.type === 'withdraw') return 0.20;
    if (unit.order?.posture === 'cautious') return 0.12;
    if (unit.order?.posture === 'aggressive') return -0.08;
    return 0;
  }
  if (unit.order?.posture === 'aggressive') return 0.15;
  if (unit.order?.posture === 'cautious') return -0.10;
  return 0;
}

export function calculateCommandAndManeuver(input: WW2CombatInput) {
  const attackerPosture = posture(input.attacker, false);
  const defenderPosture = posture(input.defender, true);
  return {
    command: clamp(input.command ?? (input.attacker.commandQuality - input.defender.commandQuality) * 0.35 + attackerPosture - defenderPosture, -0.5, 0.5),
    maneuver: clamp(input.maneuver ?? attackerPosture - defenderPosture, -0.5, 0.5),
  };
}

function reserveFraction(unit: UnitState) {
  return clamp(unit.reserveFraction ?? (unit.order?.type === 'reserve' ? C.reserveOrderFraction : C.reserveDefaultFraction));
}

function phaseCommitment(phase: WW2CombatPhase, reserve: number) {
  const phaseFactor =
    phase === 'approach' || phase === 'positioning' ? C.approachCommitment :
    phase === 'preparation' ? C.preparationCommitment :
    phase === 'main_engagement' ? 0.80 :
    phase === 'assault' ? C.assaultCommitment : 0.95;
  return clamp(phaseFactor * (1 - reserve), 0.20, 1);
}

export function calculateEffectiveness(input: WW2CombatInput, attackerQuality: WW2ForceQuality, defenderQuality: WW2ForceQuality, attackerCapability: WW2ForceCapability, defenderCapability: WW2ForceCapability, target: WW2TargetInteraction, geometry: WW2GeometryFactors, commandAndManeuver: { command: number; maneuver: number }): WW2EffectivenessFactors {
  const terrain = clamp(input.terrainDefense, 0.55, 1.55);
  const weather = 0.70 + 0.30 * clamp(input.weather);
  const surprise = clamp(input.surprise, -0.5, 0.5);
  const attackerEquipment = attackerCapability.equipment;
  const defenderEquipment = defenderCapability.equipment;
  const attackerCombatCapability = attackerEquipment * (C.combatCapabilityBase + C.combatPowerWeight * clamp(input.attacker.combatPower));
  const defenderCombatCapability = defenderEquipment * (C.combatCapabilityBase + C.combatPowerWeight * clamp(input.defender.combatPower));
  const commitmentA = phaseCommitment(geometry.phase, reserveFraction(input.attacker));
  const commitmentB = phaseCommitment(geometry.phase, reserveFraction(input.defender));
  const artilleryA = Math.max(0, input.artillerySupport ?? attackerCapability.artillery * 0.75);
  const artilleryB = Math.max(0, defenderCapability.artillery * 0.75);
  const airA = Math.max(0, input.airSupport ?? attackerCapability.air * 0.50);
  const airB = Math.max(0, defenderCapability.air * 0.50);
  const offenseA = (0.68 + 0.32 * attackerQuality.quality) * attackerQuality.ammunition * attackerQuality.sustainment * attackerQuality.wear * attackerQuality.fatigue * attackerCombatCapability * weather * geometry.rangeA * geometry.engagedA * geometry.densityRatioA * commitmentA * geometry.lineOfSight;
  const offenseB = (0.68 + 0.32 * defenderQuality.quality) * defenderQuality.ammunition * defenderQuality.sustainment * defenderQuality.wear * defenderQuality.fatigue * defenderCombatCapability * weather * geometry.rangeB * geometry.engagedB * geometry.densityRatioB * commitmentB * geometry.lineOfSight;
  const beta = C.baseRate * offenseB * terrain * geometry.exposureB * (1 + artilleryB * target.artilleryTargetB) * (1 + airB) * target.targetArmorB * target.armorTargetB * target.infantryTargetB * (1 - commandAndManeuver.maneuver * 0.45) * (1 - commandAndManeuver.command * 0.35) * (1 - surprise);
  const alpha = C.baseRate * offenseA * geometry.exposureA * (1 + artilleryA * target.artilleryTargetA) * (1 + airA) * target.targetArmorA * target.armorTargetA * target.directFireA * (1 + commandAndManeuver.maneuver * 0.65) * (1 + commandAndManeuver.command * 0.45) * (1 + surprise);
  const attackerMobility = calculateMobility(input.attacker, attackerCapability);
  const defenderMobility = calculateMobility(input.defender, defenderCapability);
  const reactionDelayHours = Math.max(0, (1 - clamp(input.defender.commandQuality)) * 6 + reserveFraction(input.defender) * 2);
  return { offenseA, offenseB, alpha, beta, attackerMobility, defenderMobility, command: commandAndManeuver.command, maneuver: commandAndManeuver.maneuver, terrain, weather, surprise, exposure: (geometry.exposureA + geometry.exposureB) / 2, attackerEquipment, defenderEquipment, reactionDelayHours };
}

function calculateMobility(unit: UnitState, capability: WW2ForceCapability) {
  const fuelFactor = 0.35 + 0.65 * clamp(unit.fuel);
  const derived = (0.35 + 0.20 * clamp(unit.readiness) + 0.15 * capability.armor + 0.10 * capability.equipment + 0.20 * clamp(unit.commandQuality)) * fuelFactor;
  return clamp(unit.mobility ?? derived);
}

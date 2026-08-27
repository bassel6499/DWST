import type { ScenarioState, SimulationReport, UnitState } from './types';

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

/**
 * Deterministic WWII conventional combat baseline.
 * This is deliberately a transparent baseline, not a claim that historical
 * combat can be reduced to one equation. Coefficients are scenario-tunable.
 */
export function resolveWW2Combat(input: WW2CombatInput): WW2CombatResult {
  const { attacker, defender } = input;
  const terrainDefense = clamp(input.terrainDefense, 0.5, 1.5);
  const weather = clamp(input.weather);
  const surprise = clamp(input.surprise);

  const attackerQuality =
    0.30 * clamp(attacker.training) +
    0.20 * clamp(attacker.experience) +
    0.20 * clamp(attacker.readiness) +
    0.15 * clamp(attacker.morale) +
    0.15 * clamp(attacker.cohesion);
  const defenderQuality =
    0.30 * clamp(defender.training) +
    0.20 * clamp(defender.experience) +
    0.20 * clamp(defender.readiness) +
    0.15 * clamp(defender.morale) +
    0.15 * clamp(defender.cohesion);

  const attackerFire = Math.max(1, attacker.personnel * (0.65 + 0.35 * attackerQuality) * (0.5 + 0.5 * clamp(attacker.ammunition)));
  const defenderFire = Math.max(1, defender.personnel * (0.65 + 0.35 * defenderQuality) * (0.5 + 0.5 * clamp(defender.ammunition)));

  const attackPower = attackerFire * (0.75 + 0.25 * weather) * (1 + input.artillerySupport) * (1 + surprise);
  const defensePower = defenderFire * terrainDefense * (0.75 + 0.25 * weather) * (1 - 0.5 * surprise);

  const attackerRate = 0.012 * (defensePower / Math.max(attackerFire, 1));
  const defenderRate = 0.012 * (attackPower / Math.max(defenderFire, 1));

  const attackerLosses = Math.min(attacker.personnel, Math.round(attacker.personnel * clamp(attackerRate)));
  const defenderLosses = Math.min(defender.personnel, Math.round(defender.personnel * clamp(defenderRate)));
  const attackerEquipmentLosses = Math.min(attacker.equipment, Math.round(attacker.equipment * clamp(attackerRate * 0.35)));
  const defenderEquipmentLosses = Math.min(defender.equipment, Math.round(defender.equipment * clamp(defenderRate * 0.35)));

  return {
    attackerLosses,
    defenderLosses,
    attackerEquipmentLosses,
    defenderEquipmentLosses,
    attackerEffectiveness: clamp(attackPower / Math.max(defensePower, 1)),
    defenderEffectiveness: clamp(defensePower / Math.max(attackPower, 1)),
  };
}

export function runWW2Turn(state: ScenarioState): SimulationReport {
  const events = [] as SimulationReport['events'];
  const turn = Math.floor(state.elapsedHours / state.turnHours) + 1;
  const units = Object.values(state.units).map(unit => ({ ...unit }));

  // Initial turn engine: update fatigue/wear and apply deterministic attrition
  // only when an explicit attack/defend order has opposing units in range.
  for (const unit of units) {
    const hasOrder = Boolean(unit.order);
    const fatigueGain = hasOrder ? 0.015 * state.turnHours / 6 : 0.005 * state.turnHours / 6;
    unit.fatigue = clamp(unit.fatigue + fatigueGain);
    unit.wear = clamp(unit.wear + (unit.echelon === 'brigade' || unit.echelon === 'division' ? 0.003 : 0.002) * state.turnHours);
    unit.logistics = clamp(unit.logistics - 0.01 * state.turnHours / 6);
  }

  events.push({
    turn,
    phase: 'sustainment',
    message: `WWII turn ${turn} resolved: deterministic sustainment, fatigue, wear, and logistics updates applied.`,
    unitIds: units.map(u => u.id),
  });

  return { turn, elapsedHours: state.elapsedHours + state.turnHours, events, units };
}

import type { UnitState } from '../../core/types';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export interface WW2CombatInput {
  attacker: UnitState;
  defender: UnitState;
  terrainDefense: number;
  weather: number;
  surprise: number;
  artillerySupport: number;
  armorSupport?: number;
  antiArmor?: number;
  airSupport?: number;
  maneuver?: number;
  command?: number;
}

export interface WW2CombatResult {
  attackerLosses: number;
  defenderLosses: number;
  attackerEquipmentLosses: number;
  defenderEquipmentLosses: number;
  attackerEffectiveness: number;
  defenderEffectiveness: number;
  factors: Record<string, number>;
}

/**
 * WW2/industrial-era combat law.
 * The governing attrition model is the requested square law:
 *   dA/dt = -beta * (B^2 / A)
 *   dB/dt = -alpha * (A^2 / B)
 * Supporting factors modify alpha/beta; they do not replace the governing law.
 */
export function resolveWW2Combat(i: WW2CombatInput): WW2CombatResult {
  const A0 = Math.max(1, i.attacker.personnel);
  const B0 = Math.max(1, i.defender.personnel);
  const q = (u: UnitState) =>
    0.30 * clamp(u.training) +
    0.20 * clamp(u.experience) +
    0.20 * clamp(u.readiness) +
    0.15 * clamp(u.morale) +
    0.15 * clamp(u.cohesion);
  const aq = q(i.attacker);
  const dq = q(i.defender);
  const ammoA = 0.5 + 0.5 * clamp(i.attacker.ammunition);
  const ammoB = 0.5 + 0.5 * clamp(i.defender.ammunition);
  const sustainA = 0.65 + 0.35 * clamp(i.attacker.logistics);
  const sustainB = 0.65 + 0.35 * clamp(i.defender.logistics);
  const wearA = 1 - 0.45 * clamp(i.attacker.wear);
  const wearB = 1 - 0.45 * clamp(i.defender.wear);
  const fatigueA = 1 - 0.40 * clamp(i.attacker.fatigue);
  const fatigueB = 1 - 0.40 * clamp(i.defender.fatigue);
  const weather = 0.75 + 0.25 * clamp(i.weather);
  const terrain = clamp(i.terrainDefense, 0.5, 1.5);
  const surprise = clamp(i.surprise, -0.5, 0.5);
  const armor = Math.max(0, i.armorSupport ?? 0);
  const antiArmor = Math.max(0, i.antiArmor ?? 0);
  const air = Math.max(0, i.airSupport ?? 0);
  const maneuver = clamp(i.maneuver ?? 0, -0.5, 0.5);
  const command = clamp(i.command ?? 0, -0.5, 0.5);

  const beta =
    0.00035 *
    (0.65 + 0.35 * aq) *
    ammoA *
    sustainA *
    wearA *
    fatigueA *
    weather *
    (1 + i.artillerySupport) *
    (1 + air) *
    (1 + armor) *
    (1 + maneuver) *
    (1 + command) *
    (1 + surprise);
  const alpha =
    0.00035 *
    (0.65 + 0.35 * dq) *
    ammoB *
    sustainB *
    wearB *
    fatigueB *
    weather *
    terrain *
    (1 + antiArmor * 0.5) *
    (1 - maneuver * 0.5) *
    (1 - command * 0.5) *
    (1 - surprise);

  const f = (A: number, B: number): [number, number] => [
    (-beta * B * B) / Math.max(A, 1),
    (-alpha * A * A) / Math.max(B, 1),
  ];
  const [k1a, k1b] = f(A0, B0);
  const [k2a, k2b] = f(A0 + k1a / 2, B0 + k1b / 2);
  const [k3a, k3b] = f(A0 + k2a / 2, B0 + k2b / 2);
  const [k4a, k4b] = f(A0 + k3a, B0 + k3b);
  const A = Math.max(0, A0 + (k1a + 2 * k2a + 2 * k3a + k4a) / 6);
  const B = Math.max(0, B0 + (k1b + 2 * k2b + 2 * k3b + k4b) / 6);
  const la = Math.round(A0 - A);
  const lb = Math.round(B0 - B);

  return {
    attackerLosses: Math.min(i.attacker.personnel, la),
    defenderLosses: Math.min(i.defender.personnel, lb),
    attackerEquipmentLosses: Math.min(i.attacker.equipment, Math.round(la * 0.025)),
    defenderEquipmentLosses: Math.min(i.defender.equipment, Math.round(lb * 0.025)),
    attackerEffectiveness: clamp((beta * B0 * B0) / A0),
    defenderEffectiveness: clamp((alpha * A0 * A0) / B0),
    factors: {
      attackerQuality: aq,
      defenderQuality: dq,
      ammoA,
      ammoB,
      sustainA,
      sustainB,
      wearA,
      wearB,
      fatigueA,
      fatigueB,
      weather,
      terrain,
      surprise,
      armor,
      antiArmor,
      air,
      maneuver,
      command,
    },
  };
}

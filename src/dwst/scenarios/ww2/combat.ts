import type { CombatUnitContext } from '../../core/combatContext';
import type { UnitState } from '../../core/types';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);

export interface WW2CombatInput {
  attacker: UnitState;
  defender: UnitState;
  terrainDefense: number;
  weather: number;
  surprise: number;
  artillerySupport?: number;
  armorSupport?: number;
  antiArmor?: number;
  airSupport?: number;
  maneuver?: number;
  command?: number;
  attackerContext?: CombatUnitContext;
  defenderContext?: CombatUnitContext;
}

export interface WW2CombatResult {
  attackerLosses: number;
  defenderLosses: number;
  attackerEquipmentLosses: number;
  defenderEquipmentLosses: number;
  attackerAmmunitionDelta: number;
  defenderAmmunitionDelta: number;
  attackerFuelDelta: number;
  defenderFuelDelta: number;
  attackerReadinessDelta: number;
  defenderReadinessDelta: number;
  attackerMoraleDelta: number;
  defenderMoraleDelta: number;
  attackerEffectiveness: number;
  defenderEffectiveness: number;
  factors: Record<string, number>;
}

function ratio(n: number, d: number, empty = 0) {
  return d > 0 ? clamp(n / d) : empty;
}

function equipmentCapability(context: CombatUnitContext | undefined) {
  if (!context) return 1;
  const operational = positive(context.equipmentOperational);
  if (operational <= 0) return 0.45;
  const readiness = ratio(context.equipmentReady, operational, 0);
  const crew = ratio(context.crewReady, context.crewRequired, 1);
  const serviceability = clamp(
    operational / Math.max(operational + context.equipmentDamaged + context.equipmentDestroyed + context.equipmentMissing, 1),
  );
  return clamp(0.35 + 0.30 * readiness + 0.20 * crew + 0.15 * serviceability);
}

function typeCapability(context: CombatUnitContext | undefined, types: string[]) {
  if (!context) return 0;
  const total = Object.values(context.equipmentByType).reduce((a, b) => a + b, 0);
  const count = types.reduce((a, type) => a + (context.equipmentByType[type] ?? 0), 0);
  return ratio(count, total);
}

/** WW2/industrial-era combat law with combined-arms capability, canonical readiness and explicit sustainment consumption. */
export function resolveWW2Combat(i: WW2CombatInput): WW2CombatResult {
  const A0 = positive(i.attacker.personnel);
  const B0 = positive(i.defender.personnel);
  if (A0 <= 0 || B0 <= 0) {
    return {
      attackerLosses: 0,
      defenderLosses: 0,
      attackerEquipmentLosses: 0,
      defenderEquipmentLosses: 0,
      attackerAmmunitionDelta: 0,
      defenderAmmunitionDelta: 0,
      attackerFuelDelta: 0,
      defenderFuelDelta: 0,
      attackerReadinessDelta: 0,
      defenderReadinessDelta: 0,
      attackerMoraleDelta: 0,
      defenderMoraleDelta: 0,
      attackerEffectiveness: 0,
      defenderEffectiveness: 0,
      factors: {},
    };
  }

  const q = (u: UnitState) =>
    0.25 * clamp(u.training) +
    0.20 * clamp(u.experience) +
    0.20 * clamp(u.readiness) +
    0.20 * clamp(u.morale) +
    0.15 * clamp(u.cohesion);
  const aq = q(i.attacker);
  const dq = q(i.defender);
  const ammoA = 0.45 + 0.55 * clamp(i.attacker.ammunition);
  const ammoB = 0.45 + 0.55 * clamp(i.defender.ammunition);
  const sustainA = 0.60 + 0.40 * clamp(i.attacker.logistics);
  const sustainB = 0.60 + 0.40 * clamp(i.defender.logistics);
  const wearA = 1 - 0.40 * clamp(i.attacker.wear);
  const wearB = 1 - 0.40 * clamp(i.defender.wear);
  const fatigueA = 1 - 0.45 * clamp(i.attacker.fatigue);
  const fatigueB = 1 - 0.45 * clamp(i.defender.fatigue);
  const weather = 0.70 + 0.30 * clamp(i.weather);
  const terrain = clamp(i.terrainDefense, 0.55, 1.55);
  const surprise = clamp(i.surprise, -0.5, 0.5);

  const posture =
    i.attacker.order?.posture === 'aggressive'
      ? 0.15
      : i.attacker.order?.posture === 'cautious'
        ? -0.10
        : 0;
  const defenderPosture =
    i.defender.order?.posture === 'cautious'
      ? 0.12
      : i.defender.order?.posture === 'aggressive'
        ? -0.08
        : 0;
  const command = clamp(
    i.command ?? (i.attacker.commandQuality - i.defender.commandQuality) * 0.35 + posture - defenderPosture,
    -0.5,
    0.5,
  );
  const maneuver = clamp(i.maneuver ?? posture - defenderPosture, -0.5, 0.5);

  const attackerEquipment = equipmentCapability(i.attackerContext);
  const defenderEquipment = equipmentCapability(i.defenderContext);
  const attackerArmor = typeCapability(i.attackerContext, ['tank', 'assaultGun', 'tankDestroyer']);
  const defenderArmor = typeCapability(i.defenderContext, ['tank', 'assaultGun', 'tankDestroyer']);
  const attackerAntiArmor = typeCapability(i.attackerContext, ['antiTank', 'tankDestroyer']);
  const defenderAntiArmor = typeCapability(i.defenderContext, ['antiTank', 'tankDestroyer']);
  const attackerArtillery = typeCapability(i.attackerContext, ['artillery', 'selfPropelledArtillery']);
  const defenderArtillery = typeCapability(i.defenderContext, ['artillery', 'selfPropelledArtillery']);
  const attackerAir = typeCapability(i.attackerContext, ['aircraft', 'airSupport']);
  const defenderAir = typeCapability(i.defenderContext, ['aircraft', 'airSupport']);

  const artilleryA = positive(i.artillerySupport ?? attackerArtillery * 0.75);
  const artilleryB = positive(defenderArtillery * 0.75);
  const armorA = positive(i.armorSupport ?? attackerArmor * 0.60);
  const armorB = positive(defenderArmor * 0.60);
  const antiArmorA = positive(i.antiArmor ?? attackerAntiArmor * 0.80);
  const antiArmorB = positive(defenderAntiArmor * 0.80);
  const airA = positive(i.airSupport ?? attackerAir * 0.50);
  const airB = positive(defenderAir * 0.50);

  const attackerCapability = attackerEquipment * (0.72 + 0.28 * clamp(i.attacker.combatPower));
  const defenderCapability = defenderEquipment * (0.72 + 0.28 * clamp(i.defender.combatPower));
  const offenseA =
    (0.68 + 0.32 * aq) * ammoA * sustainA * wearA * fatigueA * attackerCapability * weather;
  const offenseB =
    (0.68 + 0.32 * dq) * ammoB * sustainB * wearB * fatigueB * defenderCapability * weather;

  // In the square-law form dA/dt = -beta * B^2/A and dB/dt = -alpha * A^2/B,
  // beta is the defender's effectiveness against the attacker, while alpha is
  // the attacker's effectiveness against the defender. Keeping these sides
  // aligned is essential: otherwise improving the attacker paradoxically
  // increases attacker losses and can reduce defender losses.
  const beta =
    0.00035 *
    offenseB *
    terrain *
    (1 + artilleryB) *
    (1 + airB) *
    (1 + armorB) *
    (1 + antiArmorB * 0.35) *
    (1 - maneuver * 0.45) *
    (1 - command * 0.35) *
    (1 - surprise);
  const alpha =
    0.00035 *
    offenseA *
    (1 + artilleryA) *
    (1 + airA) *
    (1 + armorA) *
    (1 + antiArmorA * 0.35) *
    (1 + maneuver * 0.65) *
    (1 + command * 0.45) *
    (1 + surprise);

  const steps = 24;
  const dt = 1 / steps;
  let A = A0;
  let B = B0;
  const derivative = (a: number, b: number): [number, number] => [
    -Math.min(a, beta * b * b / Math.max(a, 1)),
    -Math.min(b, alpha * a * a / Math.max(b, 1)),
  ];

  for (let step = 0; step < steps && A > 0 && B > 0; step += 1) {
    const [k1a, k1b] = derivative(A, B);
    const [k2a, k2b] = derivative(Math.max(0, A + k1a * dt / 2), Math.max(0, B + k1b * dt / 2));
    const [k3a, k3b] = derivative(Math.max(0, A + k2a * dt / 2), Math.max(0, B + k2b * dt / 2));
    const [k4a, k4b] = derivative(Math.max(0, A + k3a * dt), Math.max(0, B + k3b * dt));
    A = Math.max(0, A + (k1a + 2 * k2a + 2 * k3a + k4a) * dt / 6);
    B = Math.max(0, B + (k1b + 2 * k2b + 2 * k3b + k4b) * dt / 6);
  }

  const la = Math.min(A0, Math.max(0, Math.round(A0 - A)));
  const lb = Math.min(B0, Math.max(0, Math.round(B0 - B)));
  const lossRateA = ratio(la, A0);
  const lossRateB = ratio(lb, B0);
  const equipmentLossA = Math.min(
    i.attacker.equipment,
    Math.round(i.attacker.equipment * (0.008 + 0.055 * lossRateA) * (0.65 + 0.35 * attackerEquipment) * (1 + armorA * 0.8)),
  );
  const equipmentLossB = Math.min(
    i.defender.equipment,
    Math.round(i.defender.equipment * (0.008 + 0.055 * lossRateB) * (0.65 + 0.35 * defenderEquipment) * (1 + armorB * 0.8)),
  );

  const intensityA = clamp(0.25 + 0.45 * lossRateA + 0.15 * artilleryA + 0.10 * airA + 0.10 * Math.abs(maneuver));
  const intensityB = clamp(0.25 + 0.45 * lossRateB + 0.15 * artilleryB + 0.10 * airB);
  const ammoDeltaA = -Math.min(i.attacker.ammunition, 0.010 + 0.035 * intensityA + 0.010 * artilleryA + 0.006 * airA);
  const ammoDeltaB = -Math.min(i.defender.ammunition, 0.010 + 0.035 * intensityB + 0.010 * artilleryB + 0.006 * airB);
  const fuelDeltaA = -Math.min(i.attacker.fuel, 0.003 + 0.012 * intensityA + 0.010 * armorA + 0.008 * Math.max(maneuver, 0));
  const fuelDeltaB = -Math.min(i.defender.fuel, 0.003 + 0.012 * intensityB + 0.010 * armorB);
  const readinessA = -clamp(0.008 + 0.20 * lossRateA + 0.025 * intensityA, 0, 0.30);
  const readinessB = -clamp(0.008 + 0.20 * lossRateB + 0.025 * intensityB, 0, 0.30);
  const moraleA = -clamp(0.004 + 0.16 * lossRateA + 0.025 * intensityA + 0.03 * Math.max(-surprise, 0), 0, 0.25);
  const moraleB = -clamp(0.004 + 0.16 * lossRateB + 0.025 * intensityB + 0.03 * Math.max(surprise, 0), 0, 0.25);

  return {
    attackerLosses: la,
    defenderLosses: lb,
    attackerEquipmentLosses: equipmentLossA,
    defenderEquipmentLosses: equipmentLossB,
    attackerAmmunitionDelta: ammoDeltaA,
    defenderAmmunitionDelta: ammoDeltaB,
    attackerFuelDelta: fuelDeltaA,
    defenderFuelDelta: fuelDeltaB,
    attackerReadinessDelta: readinessA,
    defenderReadinessDelta: readinessB,
    attackerMoraleDelta: moraleA,
    defenderMoraleDelta: moraleB,
    // Effectiveness is the side's own offensive effectiveness against its opponent.
    attackerEffectiveness: 1 - Math.exp(-alpha * A0 * A0 / Math.max(B0, 1)),
    defenderEffectiveness: 1 - Math.exp(-beta * B0 * B0 / Math.max(A0, 1)),
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
      armorA,
      armorB,
      antiArmorA,
      antiArmorB,
      artilleryA,
      artilleryB,
      airA,
      airB,
      maneuver,
      command,
      attackerEquipment,
      defenderEquipment,
      lossRateA,
      lossRateB,
    },
  };
}

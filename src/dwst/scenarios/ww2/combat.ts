import type { CombatUnitContext } from '../../core/combatContext';
import type { UnitState } from '../../core/types';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);

export const WW2_COMBAT_COEFFICIENTS = Object.freeze({
  baseRate: 0.00035,
  defaultFrontageScaleKm: 0.65,
  minimumEngagedFraction: 0.35,
  directFireRangeKm: 6,
  artilleryRangeKm: 20,
  airRangeKm: 30,
  closeAssaultKm: 3,
  mainEngagementKm: 8,
  suppressionBase: 0.04,
  suppressionFireWeight: 0.24,
  suppressionLossWeight: 0.20,
  disorganizationBase: 0.02,
  disorganizationSuppressionWeight: 0.30,
  disorganizationLossWeight: 0.20,
});

export type WW2CombatPhase = 'approach' | 'main_engagement' | 'close_assault';
export type WW2CombatOutcome = 'attacker_repulsed' | 'attacker_stalls' | 'local_gain' | 'penetration' | 'breakthrough' | 'defender_withdraws';

export interface WW2CombatInput {
  attacker: UnitState;
  defender: UnitState;
  terrainDefense: number;
  weather: number;
  surprise: number;
  distanceKm?: number;
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
  attackerSuppressionDelta: number;
  defenderSuppressionDelta: number;
  attackerDisorganizationDelta: number;
  defenderDisorganizationDelta: number;
  attackerEffectiveness: number;
  defenderEffectiveness: number;
  outcome: WW2CombatOutcome;
  phase: WW2CombatPhase;
  factors: Record<string, number>;
}

interface ForceCapability {
  equipment: number;
  armor: number;
  antiArmor: number;
  artillery: number;
  air: number;
}

interface ForceQuality {
  quality: number;
  ammunition: number;
  sustainment: number;
  wear: number;
  fatigue: number;
}

interface GeometryFactors {
  distanceKm: number;
  phase: WW2CombatPhase;
  rangeA: number;
  rangeB: number;
  frontA: number;
  frontB: number;
  engagedA: number;
  engagedB: number;
  densityA: number;
  densityB: number;
  densityRatioA: number;
  densityRatioB: number;
}

interface TargetInteraction {
  artilleryTargetA: number;
  artilleryTargetB: number;
  armorTargetA: number;
  armorTargetB: number;
  targetArmorA: number;
  targetArmorB: number;
}

interface SupportFactors {
  artilleryA: number;
  artilleryB: number;
  armorA: number;
  armorB: number;
  antiArmorA: number;
  antiArmorB: number;
  airA: number;
  airB: number;
}

interface EffectivenessFactors {
  offenseA: number;
  offenseB: number;
  alpha: number;
  beta: number;
  attackerMobility: number;
  defenderMobility: number;
  command: number;
  maneuver: number;
  terrain: number;
  weather: number;
  surprise: number;
  exposure: number;
  attackerEquipment: number;
  defenderEquipment: number;
}

interface AttritionResult {
  attackerRemaining: number;
  defenderRemaining: number;
  attackerLosses: number;
  defenderLosses: number;
}

interface CombatEffects {
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
  attackerSuppressionDelta: number;
  defenderSuppressionDelta: number;
  attackerDisorganizationDelta: number;
  defenderDisorganizationDelta: number;
  attackerEffectiveness: number;
  defenderEffectiveness: number;
  lossRateA: number;
  lossRateB: number;
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
    operational / Math.max(
      operational + context.equipmentDamaged + context.equipmentDestroyed + context.equipmentMissing,
      1,
    ),
  );
  return clamp(0.35 + 0.30 * readiness + 0.20 * crew + 0.15 * serviceability);
}

function typeCapability(context: CombatUnitContext | undefined, types: string[]) {
  if (!context) return 0;
  const total = Object.values(context.equipmentByType).reduce((a, b) => a + b, 0);
  const count = types.reduce((a, type) => a + (context.equipmentByType[type] ?? 0), 0);
  return ratio(count, total);
}

function calculateForceCapability(context: CombatUnitContext | undefined): ForceCapability {
  return {
    equipment: equipmentCapability(context),
    armor: typeCapability(context, ['tank', 'assaultGun', 'tankDestroyer']),
    antiArmor: typeCapability(context, ['antiTank', 'tankDestroyer']),
    artillery: typeCapability(context, ['artillery', 'selfPropelledArtillery']),
    air: typeCapability(context, ['aircraft', 'airSupport']),
  };
}

function calculateForceQuality(unit: UnitState): ForceQuality {
  return {
    quality:
      0.25 * clamp(unit.training) +
      0.20 * clamp(unit.experience) +
      0.20 * clamp(unit.readiness) +
      0.20 * clamp(unit.morale) +
      0.15 * clamp(unit.cohesion),
    ammunition: 0.45 + 0.55 * clamp(unit.ammunition),
    sustainment: 0.60 + 0.40 * clamp(unit.logistics),
    wear: 1 - 0.40 * clamp(unit.wear),
    fatigue: 1 - 0.45 * clamp(unit.fatigue),
  };
}

function calculatePosture(unit: UnitState, defender = false) {
  if (defender) {
    return unit.order?.type === 'withdraw'
      ? 0.20
      : unit.order?.posture === 'cautious'
        ? 0.12
        : unit.order?.posture === 'aggressive'
          ? -0.08
          : 0;
  }
  return unit.order?.posture === 'aggressive'
    ? 0.15
    : unit.order?.posture === 'cautious'
      ? -0.10
      : 0;
}

function calculateCommandAndManeuver(input: WW2CombatInput) {
  const posture = calculatePosture(input.attacker);
  const defenderPosture = calculatePosture(input.defender, true);
  return {
    command: clamp(
      input.command ??
        (input.attacker.commandQuality - input.defender.commandQuality) * 0.35 +
          posture -
          defenderPosture,
      -0.5,
      0.5,
    ),
    maneuver: clamp(input.maneuver ?? posture - defenderPosture, -0.5, 0.5),
  };
}

function calculateFrontage(unit: UnitState) {
  return Math.max(
    0.25,
    unit.frontageKm ??
      WW2_COMBAT_COEFFICIENTS.defaultFrontageScaleKm *
        Math.sqrt(Math.max(unit.personnel, 1) / 1000),
  );
}

function calculateMobility(unit: UnitState, armor: number, equipment: number) {
  const defaultMobility =
    0.35 +
    0.20 * clamp(unit.readiness) +
    0.15 * armor +
    0.10 * equipment +
    0.20 * clamp(unit.commandQuality);
  return clamp(unit.mobility ?? defaultMobility);
}

function calculatePhase(distanceKm: number): WW2CombatPhase {
  if (distanceKm <= WW2_COMBAT_COEFFICIENTS.closeAssaultKm) return 'close_assault';
  if (distanceKm <= WW2_COMBAT_COEFFICIENTS.mainEngagementKm) return 'main_engagement';
  return 'approach';
}

function calculateRangeFactor(distanceKm: number, artillery: number, air: number) {
  const direct = Math.exp(-distanceKm / WW2_COMBAT_COEFFICIENTS.directFireRangeKm);
  const indirect = Math.exp(-distanceKm / WW2_COMBAT_COEFFICIENTS.artilleryRangeKm);
  const airReach = Math.exp(-distanceKm / WW2_COMBAT_COEFFICIENTS.airRangeKm);
  return clamp(
    0.45 + 0.30 * direct + 0.18 * indirect * artillery + 0.07 * airReach * air,
    0.45,
    1,
  );
}

function calculateGeometry(input: WW2CombatInput, support: SupportFactors): GeometryFactors {
  const distanceKm = Math.max(0, input.distanceKm ?? 0);
  const frontA = calculateFrontage(input.attacker);
  const frontB = calculateFrontage(input.defender);
  const engagedA = clamp(
    frontB / frontA,
    WW2_COMBAT_COEFFICIENTS.minimumEngagedFraction,
    1,
  );
  const engagedB = clamp(
    frontA / frontB,
    WW2_COMBAT_COEFFICIENTS.minimumEngagedFraction,
    1,
  );
  const densityA = positive(input.attacker.personnel) / frontA;
  const densityB = positive(input.defender.personnel) / frontB;
  const densityRatioA = clamp(Math.sqrt(densityA / Math.max(densityB, 1)), 0.65, 1.45);
  const densityRatioB = clamp(Math.sqrt(densityB / Math.max(densityA, 1)), 0.65, 1.45);
  return {
    distanceKm,
    phase: calculatePhase(distanceKm),
    rangeA: calculateRangeFactor(distanceKm, support.artilleryA, support.airA),
    rangeB: calculateRangeFactor(distanceKm, support.artilleryB, support.airB),
    frontA,
    frontB,
    engagedA,
    engagedB,
    densityA,
    densityB,
    densityRatioA,
    densityRatioB,
  };
}

function calculateReserveCommitment(unit: UnitState) {
  const reserve = clamp(unit.reserveFraction ?? (unit.order?.type === 'reserve' ? 0.65 : 0.15));
  return clamp(1 - reserve * 0.35, 0.55, 1);
}

function calculateSupport(input: WW2CombatInput, attacker: ForceCapability, defender: ForceCapability): SupportFactors {
  return {
    artilleryA: positive(input.artillerySupport ?? attacker.artillery * 0.75),
    artilleryB: positive(defender.artillery * 0.75),
    armorA: positive(input.armorSupport ?? attacker.armor * 0.60),
    armorB: positive(defender.armor * 0.60),
    antiArmorA: positive(input.antiArmor ?? attacker.antiArmor * 0.80),
    antiArmorB: positive(defender.antiArmor * 0.80),
    airA: positive(input.airSupport ?? attacker.air * 0.50),
    airB: positive(defender.air * 0.50),
  };
}

function calculateTargetInteraction(
  support: SupportFactors,
  attacker: ForceCapability,
  defender: ForceCapability,
): TargetInteraction {
  return {
    targetArmorA:
      defender.armor > 0
        ? 1 + support.antiArmorA * (0.65 + 0.35 * defender.armor)
        : 1 + 0.25 * support.antiArmorA,
    targetArmorB:
      attacker.armor > 0
        ? 1 + support.antiArmorB * (0.65 + 0.35 * attacker.armor)
        : 1 + 0.25 * support.antiArmorB,
    armorTargetA:
      defender.armor > 0
        ? 1 + support.armorA * (0.35 + 0.65 * (1 - defender.antiArmor))
        : 1 + support.armorA * 0.75,
    armorTargetB:
      attacker.armor > 0
        ? 1 + support.armorB * (0.35 + 0.65 * (1 - attacker.antiArmor))
        : 1 + support.armorB * 0.75,
    artilleryTargetA: defender.armor > 0 ? 0.75 + 0.25 * (1 - defender.armor) : 1,
    artilleryTargetB: attacker.armor > 0 ? 0.75 + 0.25 * (1 - attacker.armor) : 1,
  };
}

function calculateExposure(terrain: number, weather: number) {
  return clamp(1.25 - 0.35 * (terrain - 1) - 0.20 * (1 - clamp(weather)), 0.55, 1.35);
}

function calculateEffectiveness(
  input: WW2CombatInput,
  attackerQuality: ForceQuality,
  defenderQuality: ForceQuality,
  attackerCapability: ForceCapability,
  defenderCapability: ForceCapability,
  support: SupportFactors,
  target: TargetInteraction,
  geometry: GeometryFactors,
  commandAndManeuver: { command: number; maneuver: number },
): EffectivenessFactors {
  const terrain = clamp(input.terrainDefense, 0.55, 1.55);
  const weather = 0.70 + 0.30 * clamp(input.weather);
  const surprise = clamp(input.surprise, -0.5, 0.5);
  const attackerEquipment = attackerCapability.equipment;
  const defenderEquipment = defenderCapability.equipment;
  const attackerCombatCapability = attackerEquipment * (0.72 + 0.28 * clamp(input.attacker.combatPower));
  const defenderCombatCapability = defenderEquipment * (0.72 + 0.28 * clamp(input.defender.combatPower));
  const reserveA = calculateReserveCommitment(input.attacker);
  const reserveB = calculateReserveCommitment(input.defender);
  const offenseA =
    (0.68 + 0.32 * attackerQuality.quality) *
    attackerQuality.ammunition *
    attackerQuality.sustainment *
    attackerQuality.wear *
    attackerQuality.fatigue *
    attackerCombatCapability *
    weather *
    geometry.rangeA *
    geometry.engagedA *
    geometry.densityRatioA *
    reserveA;
  const offenseB =
    (0.68 + 0.32 * defenderQuality.quality) *
    defenderQuality.ammunition *
    defenderQuality.sustainment *
    defenderQuality.wear *
    defenderQuality.fatigue *
    defenderCombatCapability *
    weather *
    geometry.rangeB *
    geometry.engagedB *
    geometry.densityRatioB *
    reserveB;
  const exposure = calculateExposure(terrain, input.weather);
  const beta =
    WW2_COMBAT_COEFFICIENTS.baseRate *
    offenseB *
    terrain *
    exposure *
    (1 + support.artilleryB * target.artilleryTargetB) *
    (1 + support.airB) *
    target.targetArmorB *
    target.armorTargetB *
    (1 - commandAndManeuver.maneuver * 0.45) *
    (1 - commandAndManeuver.command * 0.35) *
    (1 - surprise);
  const alpha =
    WW2_COMBAT_COEFFICIENTS.baseRate *
    offenseA *
    exposure *
    (1 + support.artilleryA * target.artilleryTargetA) *
    (1 + support.airA) *
    target.targetArmorA *
    target.armorTargetA *
    (1 + commandAndManeuver.maneuver * 0.65) *
    (1 + commandAndManeuver.command * 0.45) *
    (1 + surprise);
  return {
    offenseA,
    offenseB,
    alpha,
    beta,
    attackerMobility: calculateMobility(input.attacker, attackerCapability.armor, attackerCapability.equipment),
    defenderMobility: calculateMobility(input.defender, defenderCapability.armor, defenderCapability.equipment),
    command: commandAndManeuver.command,
    maneuver: commandAndManeuver.maneuver,
    terrain,
    weather,
    surprise,
    exposure,
    attackerEquipment,
    defenderEquipment,
  };
}

function resolveAttrition(attackerPersonnel: number, defenderPersonnel: number, alpha: number, beta: number): AttritionResult {
  const steps = 24;
  const dt = 1 / steps;
  let attackerRemaining = attackerPersonnel;
  let defenderRemaining = defenderPersonnel;
  const derivative = (a: number, b: number): [number, number] => [
    -Math.min(a, beta * b * b / Math.max(a, 1)),
    -Math.min(b, alpha * a * a / Math.max(b, 1)),
  ];
  for (let step = 0; step < steps && attackerRemaining > 0 && defenderRemaining > 0; step += 1) {
    const [k1a, k1b] = derivative(attackerRemaining, defenderRemaining);
    const [k2a, k2b] = derivative(
      Math.max(0, attackerRemaining + k1a * dt / 2),
      Math.max(0, defenderRemaining + k1b * dt / 2),
    );
    const [k3a, k3b] = derivative(
      Math.max(0, attackerRemaining + k2a * dt / 2),
      Math.max(0, defenderRemaining + k2b * dt / 2),
    );
    const [k4a, k4b] = derivative(
      Math.max(0, attackerRemaining + k3a * dt),
      Math.max(0, defenderRemaining + k3b * dt),
    );
    attackerRemaining = Math.max(0, attackerRemaining + (k1a + 2 * k2a + 2 * k3a + k4a) * dt / 6);
    defenderRemaining = Math.max(0, defenderRemaining + (k1b + 2 * k2b + 2 * k3b + k4b) * dt / 6);
  }
  return {
    attackerRemaining,
    defenderRemaining,
    attackerLosses: Math.min(attackerPersonnel, Math.max(0, Math.round(attackerPersonnel - attackerRemaining))),
    defenderLosses: Math.min(defenderPersonnel, Math.max(0, Math.round(defenderPersonnel - defenderRemaining))),
  };
}

function calculateEffects(
  input: WW2CombatInput,
  support: SupportFactors,
  effectiveness: EffectivenessFactors,
  attrition: AttritionResult,
): CombatEffects {
  const lossRateA = ratio(attrition.attackerLosses, positive(input.attacker.personnel));
  const lossRateB = ratio(attrition.defenderLosses, positive(input.defender.personnel));
  const attackerEquipmentLosses = Math.min(
    input.attacker.equipment,
    Math.round(input.attacker.equipment * (0.008 + 0.055 * lossRateA) * (0.65 + 0.35 * effectiveness.attackerEquipment) * (1 + support.armorA * 0.8)),
  );
  const defenderEquipmentLosses = Math.min(
    input.defender.equipment,
    Math.round(input.defender.equipment * (0.008 + 0.055 * lossRateB) * (0.65 + 0.35 * effectiveness.defenderEquipment) * (1 + support.armorB * 0.8)),
  );
  const fireA = clamp(0.20 + 0.45 * support.artilleryA + 0.25 * support.airA + 0.10 * support.armorA);
  const fireB = clamp(0.20 + 0.45 * support.artilleryB + 0.25 * support.airB + 0.10 * support.armorB);
  const intensityA = clamp(0.25 + 0.45 * lossRateA + 0.15 * support.artilleryA + 0.10 * support.airA + 0.10 * Math.abs(effectiveness.maneuver));
  const intensityB = clamp(0.25 + 0.45 * lossRateB + 0.15 * support.artilleryB + 0.10 * support.airB);
  const attackerSuppressionDelta = clamp(WW2_COMBAT_COEFFICIENTS.suppressionBase + WW2_COMBAT_COEFFICIENTS.suppressionFireWeight * fireB + WW2_COMBAT_COEFFICIENTS.suppressionLossWeight * lossRateB + 0.05 * Math.max(-effectiveness.surprise, 0));
  const defenderSuppressionDelta = clamp(WW2_COMBAT_COEFFICIENTS.suppressionBase + WW2_COMBAT_COEFFICIENTS.suppressionFireWeight * fireA + WW2_COMBAT_COEFFICIENTS.suppressionLossWeight * lossRateA + 0.05 * Math.max(effectiveness.surprise, 0));
  const attackerDisorganizationDelta = clamp(WW2_COMBAT_COEFFICIENTS.disorganizationBase + WW2_COMBAT_COEFFICIENTS.disorganizationSuppressionWeight * attackerSuppressionDelta + WW2_COMBAT_COEFFICIENTS.disorganizationLossWeight * lossRateA + 0.04 * Math.max(-effectiveness.command, 0));
  const defenderDisorganizationDelta = clamp(WW2_COMBAT_COEFFICIENTS.disorganizationBase + WW2_COMBAT_COEFFICIENTS.disorganizationSuppressionWeight * defenderSuppressionDelta + WW2_COMBAT_COEFFICIENTS.disorganizationLossWeight * lossRateB + 0.04 * Math.max(effectiveness.command, 0));
  const attackerAmmunitionDelta = -Math.min(input.attacker.ammunition, 0.010 + 0.035 * intensityA + 0.010 * support.artilleryA + 0.006 * support.airA);
  const defenderAmmunitionDelta = -Math.min(input.defender.ammunition, 0.010 + 0.035 * intensityB + 0.010 * support.artilleryB + 0.006 * support.airB);
  const attackerFuelDelta = -Math.min(input.attacker.fuel, 0.003 + 0.012 * intensityA + 0.010 * support.armorA + 0.008 * Math.max(effectiveness.maneuver, 0));
  const defenderFuelDelta = -Math.min(input.defender.fuel, 0.003 + 0.012 * intensityB + 0.010 * support.armorB);
  const attackerReadinessDelta = -clamp(0.008 + 0.20 * lossRateA + 0.025 * intensityA + 0.04 * attackerSuppressionDelta, 0, 0.30);
  const defenderReadinessDelta = -clamp(0.008 + 0.20 * lossRateB + 0.025 * intensityB + 0.04 * defenderSuppressionDelta, 0, 0.30);
  const attackerMoraleDelta = -clamp(0.004 + 0.16 * lossRateA + 0.025 * intensityA + 0.03 * Math.max(-effectiveness.surprise, 0), 0, 0.25);
  const defenderMoraleDelta = -clamp(0.004 + 0.16 * lossRateB + 0.025 * intensityB + 0.03 * Math.max(effectiveness.surprise, 0), 0, 0.25);
  const attackerEffectiveness = 1 - Math.exp(-effectiveness.alpha * positive(input.attacker.personnel) ** 2 / Math.max(positive(input.defender.personnel), 1));
  const defenderEffectiveness = 1 - Math.exp(-effectiveness.beta * positive(input.defender.personnel) ** 2 / Math.max(positive(input.attacker.personnel), 1));
  return {
    attackerEquipmentLosses,
    defenderEquipmentLosses,
    attackerAmmunitionDelta,
    defenderAmmunitionDelta,
    attackerFuelDelta,
    defenderFuelDelta,
    attackerReadinessDelta,
    defenderReadinessDelta,
    attackerMoraleDelta,
    defenderMoraleDelta,
    attackerSuppressionDelta,
    defenderSuppressionDelta,
    attackerDisorganizationDelta,
    defenderDisorganizationDelta,
    attackerEffectiveness,
    defenderEffectiveness,
    lossRateA,
    lossRateB,
  };
}

function determineOutcome(input: WW2CombatInput, effectiveness: EffectivenessFactors, effects: CombatEffects): WW2CombatOutcome {
  const attackerScore = effectiveness.alpha * positive(input.attacker.personnel) * (1 - effects.attackerSuppressionDelta) * (1 - effects.attackerDisorganizationDelta) * (0.65 + 0.35 * effectiveness.attackerMobility);
  const defenderScore = effectiveness.beta * positive(input.defender.personnel) * (1 - effects.defenderSuppressionDelta) * (1 - effects.defenderDisorganizationDelta) * (0.65 + 0.35 * effectiveness.defenderMobility) * effectiveness.terrain;
  const localRatio = attackerScore / Math.max(defenderScore, 1e-9);
  const attackerCanExploit = effectiveness.attackerMobility > effectiveness.defenderMobility + 0.08 && effectiveness.maneuver > -0.05 && effectiveness.command > -0.20;
  if (localRatio < 0.65) return 'attacker_repulsed';
  if (localRatio < 0.95) return 'attacker_stalls';
  if (localRatio < 1.35) return 'local_gain';
  if (attackerCanExploit && localRatio >= 1.75 && effects.defenderDisorganizationDelta >= 0.15) return 'breakthrough';
  if (attackerCanExploit && localRatio >= 1.35 && effects.defenderDisorganizationDelta >= 0.10) return 'penetration';
  if (input.defender.order?.type === 'withdraw' || effects.defenderDisorganizationDelta >= 0.45) return 'defender_withdraws';
  return 'local_gain';
}

function calculateLocalRatio(input: WW2CombatInput, effectiveness: EffectivenessFactors, effects: CombatEffects) {
  const attackerScore = effectiveness.alpha * positive(input.attacker.personnel) * (1 - effects.attackerSuppressionDelta) * (1 - effects.attackerDisorganizationDelta) * (0.65 + 0.35 * effectiveness.attackerMobility);
  const defenderScore = effectiveness.beta * positive(input.defender.personnel) * (1 - effects.defenderSuppressionDelta) * (1 - effects.defenderDisorganizationDelta) * (0.65 + 0.35 * effectiveness.defenderMobility) * effectiveness.terrain;
  return attackerScore / Math.max(defenderScore, 1e-9);
}

function buildFactors(
  attackerQuality: ForceQuality,
  defenderQuality: ForceQuality,
  support: SupportFactors,
  geometry: GeometryFactors,
  effectiveness: EffectivenessFactors,
  effects: CombatEffects,
  localRatio: number,
  reserveA: number,
  reserveB: number,
): Record<string, number> {
  return {
    attackerQuality: attackerQuality.quality,
    defenderQuality: defenderQuality.quality,
    ammoA: attackerQuality.ammunition,
    ammoB: defenderQuality.ammunition,
    sustainA: attackerQuality.sustainment,
    sustainB: defenderQuality.sustainment,
    wearA: attackerQuality.wear,
    wearB: defenderQuality.wear,
    fatigueA: attackerQuality.fatigue,
    fatigueB: defenderQuality.fatigue,
    weather: effectiveness.weather,
    terrain: effectiveness.terrain,
    surprise: effectiveness.surprise,
    distanceKm: geometry.distanceKm,
    rangeA: geometry.rangeA,
    rangeB: geometry.rangeB,
    armorA: support.armorA,
    armorB: support.armorB,
    antiArmorA: support.antiArmorA,
    antiArmorB: support.antiArmorB,
    artilleryA: support.artilleryA,
    artilleryB: support.artilleryB,
    airA: support.airA,
    airB: support.airB,
    maneuver: effectiveness.maneuver,
    command: effectiveness.command,
    attackerEquipment: effectiveness.attackerEquipment,
    defenderEquipment: effectiveness.defenderEquipment,
    frontA: geometry.frontA,
    frontB: geometry.frontB,
    engagedA: geometry.engagedA,
    engagedB: geometry.engagedB,
    densityA: geometry.densityA,
    densityB: geometry.densityB,
    densityRatioA: geometry.densityRatioA,
    densityRatioB: geometry.densityRatioB,
    reserveA,
    reserveB,
    attackerMobility: effectiveness.attackerMobility,
    defenderMobility: effectiveness.defenderMobility,
    attackerSuppression: effects.attackerSuppressionDelta,
    defenderSuppression: effects.defenderSuppressionDelta,
    attackerDisorganization: effects.attackerDisorganizationDelta,
    defenderDisorganization: effects.defenderDisorganizationDelta,
    localRatio,
    lossRateA: effects.lossRateA,
    lossRateB: effects.lossRateB,
  };
}

/** WW2 combat model: force composition → target interaction → geometry → fire → attrition → effects → tactical outcome. */
export function resolveWW2Combat(input: WW2CombatInput): WW2CombatResult {
  const attackerPersonnel = positive(input.attacker.personnel);
  const defenderPersonnel = positive(input.defender.personnel);
  if (attackerPersonnel <= 0 || defenderPersonnel <= 0) return zeroCombatResult();

  const attackerQuality = calculateForceQuality(input.attacker);
  const defenderQuality = calculateForceQuality(input.defender);
  const attackerCapability = calculateForceCapability(input.attackerContext);
  const defenderCapability = calculateForceCapability(input.defenderContext);
  const support = calculateSupport(input, attackerCapability, defenderCapability);
  const geometry = calculateGeometry(input, support);
  const targetInteraction = calculateTargetInteraction(support, attackerCapability, defenderCapability);
  const commandAndManeuver = calculateCommandAndManeuver(input);
  const effectiveness = calculateEffectiveness(input, attackerQuality, defenderQuality, attackerCapability, defenderCapability, support, targetInteraction, geometry, commandAndManeuver);
  const attrition = resolveAttrition(attackerPersonnel, defenderPersonnel, effectiveness.alpha, effectiveness.beta);
  const effects = calculateEffects(input, support, effectiveness, attrition);
  const outcome = determineOutcome(input, effectiveness, effects);
  const localRatio = calculateLocalRatio(input, effectiveness, effects);
  const reserveA = calculateReserveCommitment(input.attacker);
  const reserveB = calculateReserveCommitment(input.defender);

  return {
    attackerLosses: attrition.attackerLosses,
    defenderLosses: attrition.defenderLosses,
    attackerEquipmentLosses: effects.attackerEquipmentLosses,
    defenderEquipmentLosses: effects.defenderEquipmentLosses,
    attackerAmmunitionDelta: effects.attackerAmmunitionDelta,
    defenderAmmunitionDelta: effects.defenderAmmunitionDelta,
    attackerFuelDelta: effects.attackerFuelDelta,
    defenderFuelDelta: effects.defenderFuelDelta,
    attackerReadinessDelta: effects.attackerReadinessDelta,
    defenderReadinessDelta: effects.defenderReadinessDelta,
    attackerMoraleDelta: effects.attackerMoraleDelta,
    defenderMoraleDelta: effects.defenderMoraleDelta,
    attackerSuppressionDelta: effects.attackerSuppressionDelta,
    defenderSuppressionDelta: effects.defenderSuppressionDelta,
    attackerDisorganizationDelta: effects.attackerDisorganizationDelta,
    defenderDisorganizationDelta: effects.defenderDisorganizationDelta,
    attackerEffectiveness: effects.attackerEffectiveness,
    defenderEffectiveness: effects.defenderEffectiveness,
    outcome,
    phase: geometry.phase,
    factors: buildFactors(attackerQuality, defenderQuality, support, geometry, effectiveness, effects, localRatio, reserveA, reserveB),
  };
}

function zeroCombatResult(): WW2CombatResult {
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
    attackerSuppressionDelta: 0,
    defenderSuppressionDelta: 0,
    attackerDisorganizationDelta: 0,
    defenderDisorganizationDelta: 0,
    attackerEffectiveness: 0,
    defenderEffectiveness: 0,
    outcome: 'attacker_stalls',
    phase: 'approach',
    factors: {},
  };
}

import type { CombatUnitContext } from '../../core/combatContext';
import type { UnitState } from '../../core/types';
import { WW2_COMBAT_COEFFICIENTS as C } from './combatCoefficients';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);

export interface WW2ForceCapability {
  readonly equipment: number;
  readonly armor: number;
  readonly antiArmor: number;
  readonly artillery: number;
  readonly air: number;
  readonly infantry: number;
}

export interface WW2ForceQuality {
  readonly quality: number;
  readonly ammunition: number;
  readonly sustainment: number;
  readonly wear: number;
  readonly fatigue: number;
  readonly suppression: number;
  readonly disorganization: number;
}

function ratio(n: number, d: number, empty = 0) {
  return d > 0 ? clamp(n / d) : empty;
}

function equipmentCapability(context: CombatUnitContext | undefined) {
  if (!context) return 1;
  const operational = positive(context.equipmentOperational);
  if (operational <= 0) return 0.45;

  const readiness = ratio(context.equipmentReady, operational);
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

/** Converts canonical equipment/crew records into WW2 combat capabilities. */
export function calculateForceCapability(
  context: CombatUnitContext | undefined,
): WW2ForceCapability {
  return {
    equipment: equipmentCapability(context),
    armor: typeCapability(context, ['tank', 'assaultGun', 'tankDestroyer']),
    antiArmor: typeCapability(context, ['antiTank', 'tankDestroyer']),
    artillery: typeCapability(context, ['artillery', 'selfPropelledArtillery']),
    air: typeCapability(context, ['aircraft', 'airSupport']),
    infantry: typeCapability(context, ['infantry']),
  };
}

/**
 * Converts persistent unit condition into the combat-readiness vector.
 * Existing suppression/disorganization reduce usable combat quality on the
 * following resolution; ammunition is a true firing-capacity input.
 */
export function calculateForceQuality(unit: UnitState): WW2ForceQuality {
  const baseQuality =
    C.qualityTrainingWeight * clamp(unit.training) +
    C.qualityExperienceWeight * clamp(unit.experience) +
    C.qualityReadinessWeight * clamp(unit.readiness) +
    C.qualityMoraleWeight * clamp(unit.morale) +
    C.qualityCohesionWeight * clamp(unit.cohesion);

  return {
    quality:
      baseQuality *
      (1 - 0.55 * clamp(unit.suppression)) *
      (1 - 0.65 * clamp(unit.disorganization)),
    ammunition: clamp(unit.ammunition),
    sustainment: C.sustainmentBase + C.sustainmentWeight * clamp(unit.logistics),
    wear: 1 - C.wearWeight * clamp(unit.wear),
    fatigue: 1 - C.fatigueWeight * clamp(unit.fatigue),
    suppression: clamp(unit.suppression),
    disorganization: clamp(unit.disorganization),
  };
}

/** Fuel availability is a mobility constraint, not a post-combat statistic. */
export function calculateMobility(unit: UnitState, capability: WW2ForceCapability) {
  const fuelFactor = 0.35 + 0.65 * clamp(unit.fuel);
  const derived =
    (0.35 +
      0.20 * clamp(unit.readiness) +
      0.15 * capability.armor +
      0.10 * capability.equipment +
      0.20 * clamp(unit.commandQuality)) *
    fuelFactor;

  return clamp(unit.mobility ?? derived);
}

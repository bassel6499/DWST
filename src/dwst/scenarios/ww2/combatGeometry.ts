import type { UnitState } from '../../core/types';
import type { WW2ForceCapability } from './combatCapability';
import type { WW2CombatInput, WW2CombatPhase } from './combat';
import { WW2_COMBAT_COEFFICIENTS as C } from './combatCoefficients';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);

export type WW2TerrainType = 'open' | 'rolling' | 'forest' | 'urban' | 'ridge' | 'valley' | 'river' | 'marsh' | 'fortified';

export interface WW2GeometryFactors {
  readonly distanceKm: number;
  readonly phase: WW2CombatPhase;
  readonly rangeA: number;
  readonly rangeB: number;
  readonly frontA: number;
  readonly frontB: number;
  readonly engagedA: number;
  readonly engagedB: number;
  readonly densityA: number;
  readonly densityB: number;
  readonly densityRatioA: number;
  readonly densityRatioB: number;
  readonly lineOfSight: number;
  readonly exposureA: number;
  readonly exposureB: number;
  readonly terrainEffect: number;
}

const terrainExposure: Record<WW2TerrainType, number> = {
  open: 1.15,
  rolling: 1.00,
  forest: 0.68,
  urban: 0.55,
  ridge: 0.72,
  valley: 0.82,
  river: 0.60,
  marsh: 0.58,
  fortified: 0.48,
};

export function calculateFrontage(unit: UnitState) {
  return Math.max(0.25, unit.frontageKm ?? C.defaultFrontageScaleKm * Math.sqrt(Math.max(unit.personnel, 1) / 1000));
}

export function calculatePhase(distanceKm: number): WW2CombatPhase {
  if (distanceKm <= C.closeAssaultKm) return 'close_assault';
  if (distanceKm <= C.mainEngagementKm) return 'main_engagement';
  return distanceKm <= C.phasePreparationRangeKm ? 'preparation' : 'approach';
}

export function calculateRangeFactor(distanceKm: number, artillery: number, air: number) {
  const direct = Math.exp(-distanceKm / C.directFireRangeKm);
  const indirect = Math.exp(-distanceKm / C.artilleryRangeKm);
  const airReach = Math.exp(-distanceKm / C.airRangeKm);
  return clamp(0.45 + 0.30 * direct + 0.18 * indirect * artillery + 0.07 * airReach * air, 0.45, 1);
}

export function calculateTerrainExposure(input: WW2CombatInput) {
  const terrain = clamp(input.terrainDefense, 0.55, 1.55);
  const weather = clamp(input.weather);
  const base = input.terrainType ? terrainExposure[input.terrainType] : clamp(1.25 - 0.35 * (terrain - 1), 0.55, 1.35);
  const weatherFactor = 1 - 0.20 * (1 - weather);
  return clamp(base * weatherFactor * clamp(input.lineOfSight ?? 1) * clamp(input.targetExposure ?? 1), 0.25, 1.35);
}

export function calculateGeometry(input: WW2CombatInput, attacker: WW2ForceCapability, defender: WW2ForceCapability): WW2GeometryFactors {
  const distanceKm = Math.max(0, input.distanceKm ?? 0);
  const frontA = calculateFrontage(input.attacker);
  const frontB = calculateFrontage(input.defender);
  const engagedA = clamp(frontB / frontA, C.minimumEngagedFraction, 1);
  const engagedB = clamp(frontA / frontB, C.minimumEngagedFraction, 1);
  const densityA = positive(input.attacker.personnel) / frontA;
  const densityB = positive(input.defender.personnel) / frontB;
  const densityRatioA = clamp(Math.sqrt(densityA / Math.max(densityB, 1)), C.densityMin, C.densityMax);
  const densityRatioB = clamp(Math.sqrt(densityB / Math.max(densityA, 1)), C.densityMin, C.densityMax);
  const exposure = calculateTerrainExposure(input);
  const lineOfSight = clamp(input.lineOfSight ?? (input.terrainType === 'forest' || input.terrainType === 'urban' ? 0.70 : 1));
  return {
    distanceKm,
    phase: calculatePhase(distanceKm),
    rangeA: calculateRangeFactor(distanceKm, attacker.artillery, attacker.air),
    rangeB: calculateRangeFactor(distanceKm, defender.artillery, defender.air),
    frontA, frontB, engagedA, engagedB, densityA, densityB, densityRatioA, densityRatioB,
    lineOfSight,
    exposureA: exposure,
    exposureB: exposure,
    terrainEffect: clamp(input.terrainDefense, 0.55, 1.55),
  };
}

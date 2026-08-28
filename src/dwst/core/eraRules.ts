import type { EraId, ScenarioState, UnitState } from './types';
import { resolveWW2Combat } from '../scenarios/ww2/combat';

export type CombatLaw =
  | 'linear'
  | 'mixed'
  | 'new-square'
  | 'square'
  | 'contemporary-hybrid'
  | 'extended-square';

export interface EngineCoefficients {
  movementHours: number;
  movementReadinessWeight: number;
  movementCommandWeight: number;
  movementFatigue: number;
  movementWear: number;
  movementFuel: number;
  turnFatigue: number;
  logisticsDrain: number;
  readinessDrain: number;
  readinessLogisticsWeight: number;
  readinessFatiguePenalty: number;
  readinessWearPenalty: number;
  trainingEffect: number;
  experienceEffect: number;
  cohesionEffect: number;
  moraleEffect: number;
  commandEffect: number;
}

export interface UnitAssessmentPolicy {
  destroyedPersonnel: number;
  disorganizedPersonnel: number;
  disorganizedCondition: number;
}

export type DetectionSensorType = 'visual' | 'recon' | 'airRecon' | 'signals';

/**
 * Era-owned detection parameters consumed by the generic contact pipeline.
 * The pipeline itself remains core-owned so eras do not duplicate contact
 * bookkeeping or geographic distance logic.
 */
export interface DetectionPolicy {
  baseUnaidedRangeKm: number;
  sensorRangeModifiers: Record<DetectionSensorType, number>;
  intelligenceFloor: number;
  intelligenceWeight: number;
  readinessFloor: number;
  readinessWeight: number;
  weatherFloor: number;
  weatherWeight: number;
  terrainFloor: number;
  terrainWeight: number;
  formationConfidenceThreshold: number;
  unitConfidenceThreshold: number;
}

export interface CombatResult {
  attackerLosses: number;
  defenderLosses: number;
  attackerEquipmentLosses: number;
  defenderEquipmentLosses: number;
}

export type CombatResolver = (input: {
  attacker: UnitState;
  defender: UnitState;
  state: ScenarioState;
  surprise: number;
}) => CombatResult;

export interface EraRuleset {
  id: EraId;
  label: string;
  implemented: boolean;
  combatLaw: CombatLaw;
  rangedFire: boolean;
  spatialModel: 'none' | 'pde' | 'pde-hybrid';
  defaultTurnHours: number;
  equipmentCrewCoupling: boolean;
  permanentAttrition: boolean;
  logisticsEnabled: boolean;
  engine: EngineCoefficients;
  unitAssessment: UnitAssessmentPolicy;
  detection: DetectionPolicy;
  /** Combat implementation owned by this era. Absent means the era is not runnable. */
  resolveCombat?: CombatResolver;
  notes: string[];
}

export const DEFAULT_ENGINE: Readonly<EngineCoefficients> = {
  movementHours: 6,
  movementReadinessWeight: 0.65,
  movementCommandWeight: 0.3,
  movementFatigue: 0.04,
  movementWear: 0.02,
  movementFuel: 0.04,
  turnFatigue: 0.01,
  logisticsDrain: 0.015,
  readinessDrain: 0.005,
  readinessLogisticsWeight: 0.4,
  readinessFatiguePenalty: 0.35,
  readinessWearPenalty: 0.25,
  trainingEffect: 0.25,
  experienceEffect: 0.25,
  cohesionEffect: 0.25,
  moraleEffect: 0.25,
  commandEffect: 0.2,
};

export const DEFAULT_DETECTION_POLICY: Readonly<DetectionPolicy> = {
  baseUnaidedRangeKm: 12,
  sensorRangeModifiers: {
    visual: 1,
    recon: 1.25,
    airRecon: 1.7,
    signals: 1.1,
  },
  intelligenceFloor: 0.65,
  intelligenceWeight: 0.35,
  readinessFloor: 0.7,
  readinessWeight: 0.3,
  weatherFloor: 0.65,
  weatherWeight: 0.35,
  terrainFloor: 0.75,
  terrainWeight: 0.25,
  formationConfidenceThreshold: 0.85,
  unitConfidenceThreshold: 0.55,
};

const DEFAULT_UNIT_ASSESSMENT: UnitAssessmentPolicy = {
  destroyedPersonnel: 0.2,
  disorganizedPersonnel: 0.5,
  disorganizedCondition: 0.4,
};

const scaffoldNotes = [
  'Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.',
];

const ww2Combat: CombatResolver = ({ attacker, defender, state, surprise }) => {
  const result = resolveWW2Combat({
    attacker,
    defender,
    terrainDefense: state.terrain,
    weather: state.weather,
    surprise,
    artillerySupport: 0,
    armorSupport: 0,
    antiArmor: 0,
    airSupport: 0,
    maneuver: 0,
    command: 0,
  });

  return {
    attackerLosses: result.attackerLosses,
    defenderLosses: result.defenderLosses,
    attackerEquipmentLosses: result.attackerEquipmentLosses,
    defenderEquipmentLosses: result.defenderEquipmentLosses,
  };
};

const base = (
  id: EraId,
  label: string,
  combatLaw: CombatLaw,
  turn: number,
): EraRuleset => ({
  id,
  label,
  implemented: false,
  combatLaw,
  rangedFire: true,
  spatialModel: 'pde-hybrid',
  defaultTurnHours: turn,
  equipmentCrewCoupling: true,
  permanentAttrition: true,
  logisticsEnabled: true,
  engine: { ...DEFAULT_ENGINE },
  unitAssessment: { ...DEFAULT_UNIT_ASSESSMENT },
  detection: {
    ...DEFAULT_DETECTION_POLICY,
    sensorRangeModifiers: { ...DEFAULT_DETECTION_POLICY.sensorRangeModifiers },
  },
  notes: [...scaffoldNotes],
});

export const ERA_RULESETS: Record<EraId, EraRuleset> = {
  ancient: { ...base('ancient', 'Ancient', 'linear', 24), rangedFire: false, spatialModel: 'pde' },
  medieval: { ...base('medieval', 'Medieval', 'mixed', 12), spatialModel: 'pde' },
  'early-modern': base('early-modern', 'Early Modern', 'new-square', 12),
  industrial: base('industrial', 'Industrial', 'square', 6),
  ww1: base('ww1', 'World War I', 'square', 6),
  interwar: base('interwar', 'Interwar', 'square', 6),
  ww2: {
    ...base('ww2', 'World War II', 'square', 6),
    implemented: true,
    resolveCombat: ww2Combat,
    notes: ['First runnable DWST ruleset. Combined arms, operational maneuver and high-tempo logistics.'],
  },
  'early-cold-war': base('early-cold-war', 'Early Cold War', 'square', 3),
  'late-cold-war': base('late-cold-war', 'Late Cold War', 'square', 3),
  'post-cold-war': base('post-cold-war', 'Post-Cold War', 'contemporary-hybrid', 3),
  contemporary: base('contemporary', 'Contemporary', 'contemporary-hybrid', 1),
  future: base('future', 'Future', 'extended-square', 1),
};

export function getEraRuleset(id: EraId): EraRuleset {
  return ERA_RULESETS[id];
}

export function getImplementedEraRulesets(): EraRuleset[] {
  return Object.values(ERA_RULESETS).filter((r) => r.implemented);
}

export function validateEraRuleset(r: EraRuleset): string[] {
  const errors: string[] = [];

  if (!r.id || !r.label) errors.push('Era ruleset requires id and label');
  if (r.defaultTurnHours <= 0) errors.push('defaultTurnHours must be positive');
  if (r.permanentAttrition !== true) {
    errors.push('permanentAttrition must remain enabled for DWST accounting');
  }

  for (const [key, value] of Object.entries(r.engine)) {
    if (!Number.isFinite(value) || value < 0) {
      errors.push(`engine.${key} must be a non-negative finite number`);
    }
  }

  if (r.engine.movementHours <= 0) {
    errors.push('engine.movementHours must be positive');
  }

  const assessment = r.unitAssessment;
  if (
    !assessment ||
    !Number.isFinite(assessment.destroyedPersonnel) ||
    !Number.isFinite(assessment.disorganizedPersonnel) ||
    !Number.isFinite(assessment.disorganizedCondition)
  ) {
    errors.push('unitAssessment thresholds must be finite numbers');
  } else {
    if (assessment.destroyedPersonnel < 0 || assessment.destroyedPersonnel > 1) {
      errors.push('unitAssessment.destroyedPersonnel must be between 0 and 1');
    }
    if (assessment.disorganizedPersonnel < 0 || assessment.disorganizedPersonnel > 1) {
      errors.push('unitAssessment.disorganizedPersonnel must be between 0 and 1');
    }
    if (assessment.disorganizedCondition < 0 || assessment.disorganizedCondition > 1) {
      errors.push('unitAssessment.disorganizedCondition must be between 0 and 1');
    }
    if (assessment.destroyedPersonnel > assessment.disorganizedPersonnel) {
      errors.push('unitAssessment.destroyedPersonnel must not exceed disorganizedPersonnel');
    }
  }

  const detection = r.detection;
  if (!detection || !Number.isFinite(detection.baseUnaidedRangeKm) || detection.baseUnaidedRangeKm < 0) {
    errors.push('detection.baseUnaidedRangeKm must be a non-negative finite number');
  } else {
    const numericDetectionFields = [
      'intelligenceFloor',
      'intelligenceWeight',
      'readinessFloor',
      'readinessWeight',
      'weatherFloor',
      'weatherWeight',
      'terrainFloor',
      'terrainWeight',
      'formationConfidenceThreshold',
      'unitConfidenceThreshold',
    ] as const;
    for (const key of numericDetectionFields) {
      const value = detection[key];
      if (!Number.isFinite(value) || value < 0 || value > 1) {
        errors.push(`detection.${key} must be between 0 and 1`);
      }
    }
    for (const sensorType of Object.keys(DEFAULT_DETECTION_POLICY.sensorRangeModifiers) as DetectionSensorType[]) {
      const value = detection.sensorRangeModifiers[sensorType];
      if (!Number.isFinite(value) || value < 0) {
        errors.push(`detection.sensorRangeModifiers.${sensorType} must be a non-negative finite number`);
      }
    }
    if (detection.formationConfidenceThreshold < detection.unitConfidenceThreshold) {
      errors.push('detection.formationConfidenceThreshold must not be below unitConfidenceThreshold');
    }
  }

  if (r.implemented && !r.resolveCombat) {
    errors.push('implemented era ruleset requires resolveCombat');
  }

  return errors;
}

import { resolveWW2Combat, type WW2CombatInput, type WW2CombatResult } from './combat';

export interface WW2CalibrationCase {
  readonly id: string;
  readonly baseline: WW2CombatInput;
  readonly variant: WW2CombatInput;
  readonly assertions: readonly ((baseline: WW2CombatResult, variant: WW2CombatResult) => boolean)[];
}

export interface WW2CalibrationResult {
  readonly id: string;
  readonly passed: boolean;
  readonly baseline: WW2CombatResult;
  readonly variant: WW2CombatResult;
}

/** Deterministic qualitative calibration harness; it never invents historical values. */
export function evaluateWW2Calibration(cases: readonly WW2CalibrationCase[]): WW2CalibrationResult[] {
  return cases.map((testCase) => {
    const baseline = resolveWW2Combat(testCase.baseline);
    const variant = resolveWW2Combat(testCase.variant);
    const repeat = resolveWW2Combat(testCase.variant);
    return {
      id: testCase.id,
      passed: testCase.assertions.every((assertion) => assertion(baseline, variant)) &&
        JSON.stringify(variant) === JSON.stringify(repeat),
      baseline,
      variant,
    };
  });
}

export interface WW2HistoricalObservation {
  readonly attackerPersonnelLossRate?: number;
  readonly defenderPersonnelLossRate?: number;
  readonly attackerEquipmentLossRate?: number;
  readonly defenderEquipmentLossRate?: number;
  readonly durationHours?: number;
  readonly advanceKm?: number;
}

export interface WW2HistoricalBenchmark {
  readonly id: string;
  readonly label: string;
  readonly input?: WW2CombatInput;
  readonly observed?: WW2HistoricalObservation;
  readonly source?: string;
}

export interface WW2HistoricalError {
  readonly id: string;
  readonly metrics: Partial<Record<keyof WW2HistoricalObservation, number>>;
}

function absoluteError(actual: number, observed: number | undefined) {
  return observed === undefined ? undefined : Math.abs(actual - observed);
}

/** Compares a simulated result with supplied observations; no tuning is performed here. */
export function compareWW2HistoricalBenchmark(
  benchmark: WW2HistoricalBenchmark,
  result: WW2CombatResult,
): WW2HistoricalError {
  const observed = benchmark.observed ?? {};
  const metrics: Partial<Record<keyof WW2HistoricalObservation, number>> = {};
  const attackerPersonnel = Math.max(1, benchmark.input?.attacker.personnel ?? 1);
  const defenderPersonnel = Math.max(1, benchmark.input?.defender.personnel ?? 1);
  const attackerEquipment = Math.max(1, benchmark.input?.attacker.equipment ?? 1);
  const defenderEquipment = Math.max(1, benchmark.input?.defender.equipment ?? 1);
  const values: Record<keyof WW2HistoricalObservation, number> = {
    attackerPersonnelLossRate: result.attackerLosses / attackerPersonnel,
    defenderPersonnelLossRate: result.defenderLosses / defenderPersonnel,
    attackerEquipmentLossRate: result.attackerEquipmentLosses / attackerEquipment,
    defenderEquipmentLossRate: result.defenderEquipmentLosses / defenderEquipment,
    durationHours: 1,
    advanceKm: result.attackerAdvanceKm,
  };
  for (const key of Object.keys(observed) as (keyof WW2HistoricalObservation)[]) {
    const error = absoluteError(values[key], observed[key]);
    if (error !== undefined) metrics[key] = error;
  }
  return { id: benchmark.id, metrics };
}

/** Historical data is intentionally an input boundary: no unverified values are embedded here. */
export const WW2_HISTORICAL_BENCHMARKS: readonly WW2HistoricalBenchmark[] = Object.freeze([]);

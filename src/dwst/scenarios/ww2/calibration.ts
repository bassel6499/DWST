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

/**
 * Deterministic calibration harness. It expresses qualitative invariants
 * rather than inventing historical coefficient values. Historical benchmark
 * data can be supplied later without changing the resolver contract.
 */
export function evaluateWW2Calibration(cases: readonly WW2CalibrationCase[]): WW2CalibrationResult[] {
  return cases.map((testCase) => {
    const baseline = resolveWW2Combat(testCase.baseline);
    const variant = resolveWW2Combat(testCase.variant);
    return {
      id: testCase.id,
      passed: testCase.assertions.every((assertion) => assertion(baseline, variant)) && JSON.stringify(variant) === JSON.stringify(resolveWW2Combat(testCase.variant)),
      baseline,
      variant,
    };
  });
}

export interface WW2HistoricalBenchmark {
  readonly id: string;
  readonly label: string;
  readonly observed?: {
    readonly attackerPersonnelLossRate?: number;
    readonly defenderPersonnelLossRate?: number;
    readonly attackerEquipmentLossRate?: number;
    readonly defenderEquipmentLossRate?: number;
    readonly durationHours?: number;
    readonly advanceKm?: number;
  };
  readonly source?: string;
}

/** Historical data is intentionally an input boundary: no unverified values are embedded here. */
export const WW2_HISTORICAL_BENCHMARKS: readonly WW2HistoricalBenchmark[] = Object.freeze([]);

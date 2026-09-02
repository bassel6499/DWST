import { resolveWW2Combat, type WW2CombatInput } from './combat';

export interface WW2CalibrationCase {
  readonly id: string;
  readonly input: WW2CombatInput;
  readonly assertions: readonly ((baseline: ReturnType<typeof resolveWW2Combat>, current: ReturnType<typeof resolveWW2Combat>) => boolean)[];
}

export interface WW2CalibrationResult {
  readonly id: string;
  readonly passed: boolean;
  readonly result: ReturnType<typeof resolveWW2Combat>;
}

/**
 * Deterministic calibration harness. It deliberately expresses qualitative
 * invariants rather than inventing historical coefficient values. Historical
 * benchmark data can be supplied later without changing the resolver contract.
 */
export function evaluateWW2Calibration(cases: readonly WW2CalibrationCase[]): WW2CalibrationResult[] {
  return cases.map((testCase) => {
    const baseline = resolveWW2Combat(testCase.input);
    const current = resolveWW2Combat(testCase.input);
    return {
      id: testCase.id,
      passed: testCase.assertions.every((assertion) => assertion(baseline, current)) && JSON.stringify(baseline) === JSON.stringify(current),
      result: current,
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

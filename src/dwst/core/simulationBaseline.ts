import type { ScenarioState, UnitState } from './types';

export interface SimulationBaseline {
  readonly scenarioId: string;
  readonly units: Readonly<Record<string, number>>;
}

/** Capture immutable personnel baselines from a scenario at simulation start. */
export function captureSimulationBaseline(state: ScenarioState): SimulationBaseline {
  return Object.freeze({
    scenarioId: state.id,
    units: Object.freeze(Object.fromEntries(
      Object.values(state.units).map((unit) => [unit.id, unit.personnel]),
    )),
  });
}

/** Return current personnel as a fraction of the unit's simulation-start baseline. */
export function relativePersonnelStrength(unit: UnitState, baseline: SimulationBaseline): number {
  const initial = baseline.units[unit.id];
  if (initial === undefined || initial <= 0) return 0;
  return Math.max(0, Math.min(1, unit.personnel / initial));
}

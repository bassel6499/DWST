import { describe, expect, it } from 'vitest';
import type { ScenarioState, UnitState } from './types';
import { captureSimulationBaseline, relativePersonnelStrength } from './simulationBaseline';

const unit = (id: string, personnel: number): UnitState => ({
  id, name: id, side: 'allied', echelon: 'battalion',
  personnel, equipment: 100, ammunition: 1, fuel: 1,
  readiness: 1, training: 1, experience: 1, morale: 1, cohesion: 1,
  fatigue: 0, wear: 0, logistics: 1, commandQuality: 1, intelligence: 1,
  combatPower: 100, status: 'operational', position: { lon: 0, lat: 0 },
  cumulativeLosses: 0, history: [],
});

const scenario: ScenarioState = {
  id: 'baseline-test', name: 'Baseline test', era: 'ww2', scale: 'tactical',
  turnHours: 6, elapsedHours: 0, weather: 0, terrain: 0, intelLevel: 1,
  units: { a: unit('a', 1000), b: unit('b', 5000) }, events: [],
};

describe('simulation baseline', () => {
  it('captures personnel at simulation start without mutating the scenario', () => {
    const baseline = captureSimulationBaseline(scenario);
    expect(baseline.scenarioId).toBe(scenario.id);
    expect(baseline.units).toEqual({ a: 1000, b: 5000 });
    expect(Object.isFrozen(baseline)).toBe(true);
    expect(Object.isFrozen(baseline.units)).toBe(true);
  });

  it('computes relative strength independently of unit scale', () => {
    const baseline = captureSimulationBaseline(scenario);
    expect(relativePersonnelStrength({ ...scenario.units.a, personnel: 500 }, baseline)).toBe(0.5);
    expect(relativePersonnelStrength({ ...scenario.units.b, personnel: 2500 }, baseline)).toBe(0.5);
  });

  it('clamps strength to the valid range', () => {
    const baseline = captureSimulationBaseline(scenario);
    expect(relativePersonnelStrength({ ...scenario.units.a, personnel: 1500 }, baseline)).toBe(1);
    expect(relativePersonnelStrength({ ...scenario.units.a, personnel: -10 }, baseline)).toBe(0);
  });
});

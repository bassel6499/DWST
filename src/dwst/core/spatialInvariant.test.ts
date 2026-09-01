import { describe, expect, it } from 'vitest';
import { assertScenarioSpatialIntegrity, validateScenarioSpatialIntegrity } from './spatialInvariant';
import type { ScenarioState, UnitState } from './types';

function unit(overrides: Partial<UnitState> = {}): UnitState {
  return {
    id: 'unit-1',
    name: 'Unit 1',
    side: 'allied',
    echelon: 'battalion',
    personnel: 100,
    equipment: 10,
    ammunition: 1,
    fuel: 1,
    readiness: 1,
    training: 1,
    experience: 1,
    morale: 1,
    cohesion: 1,
    fatigue: 0,
    wear: 0,
    logistics: 1,
    commandQuality: 1,
    intelligence: 1,
    combatPower: 100,
    status: 'operational',
    position: { lon: 35, lat: 33 },
    cumulativeLosses: 0,
    history: [],
    ...overrides,
  };
}

function scenario(overrides: Partial<ScenarioState> = {}): ScenarioState {
  return {
    id: 'scenario',
    name: 'Scenario',
    era: 'ww2',
    scale: 'operational',
    turnHours: 6,
    elapsedHours: 0,
    weather: 1,
    terrain: 1,
    intelLevel: 1,
    units: { 'unit-1': unit() },
    events: [],
    ...overrides,
  };
}

describe('scenario spatial integrity', () => {
  it('accepts canonical WorldPosition as the single current unit location', () => {
    expect(validateScenarioSpatialIntegrity(scenario())).toEqual([]);
  });

  it('accepts a valid geographic order destination without treating it as current position', () => {
    const state = scenario({
      units: {
        'unit-1': unit({
          order: { type: 'move', destination: { lon: 36, lat: 34 } },
        }),
      },
    });
    expect(validateScenarioSpatialIntegrity(state)).toEqual([]);
  });

  it('rejects an invalid canonical current position', () => {
    const state = scenario({
      units: { 'unit-1': unit({ position: { lon: 200, lat: 33 } }) },
    });
    expect(validateScenarioSpatialIntegrity(state)).toContain("Unit 'unit-1' has an invalid canonical position.");
  });

  it('rejects an invalid movement destination', () => {
    const state = scenario({
      units: {
        'unit-1': unit({
          order: { type: 'move', destination: { lon: 35, lat: 100 } },
        }),
      },
    });
    expect(() => assertScenarioSpatialIntegrity(state)).toThrow('invalid movement destination');
  });

  it('rejects mismatched unit record and scenario key', () => {
    const state = scenario({
      units: { key: unit({ id: 'different-id' }) },
    });
    expect(validateScenarioSpatialIntegrity(state)).toContain("Unit key 'key' does not match unit.id 'different-id'.");
  });
});

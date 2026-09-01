import { describe, expect, it } from 'vitest';
import { resolveEngagements } from './combat';
import type { ScenarioState, UnitState } from './types';

function unit(id: string, side: UnitState['side'], lon: number, order?: UnitState['order']): UnitState {
  return {
    id,
    name: id,
    side,
    echelon: 'company',
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
    position: { lon, lat: 0 },
    order,
    cumulativeLosses: 0,
    history: [],
  };
}

function scenario(sensors: ScenarioState['sensors'] = []): ScenarioState {
  return {
    id: 'sensor-combat-test',
    name: 'sensor combat test',
    era: 'ww2',
    scale: 'tactical',
    turnHours: 1,
    elapsedHours: 0,
    weather: 1,
    terrain: 1,
    intelLevel: 1,
    units: {
      observer: unit('observer', 'allied', 0, { type: 'attack' }),
      target: unit('target', 'enemy', 0.18),
    },
    events: [],
    sensors,
  };
}

describe('combat sensor integration', () => {
  it('passes scenario-owned sensors into operational detection', () => {
    const withoutSensor = resolveEngagements(scenario());
    expect(withoutSensor).toEqual([]);

    const withSensor = resolveEngagements(scenario([
      { id: 'recon-1', unitId: 'observer', type: 'recon', rangeKm: 20, quality: 1 },
    ]));

    expect(withSensor).toHaveLength(1);
    expect(withSensor[0]?.attackerId).toBe('observer');
    expect(withSensor[0]?.defenderId).toBe('target');
    expect(withSensor[0]?.detectedByAttacker).toBe(true);
  });
});

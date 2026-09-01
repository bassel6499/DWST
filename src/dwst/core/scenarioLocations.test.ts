import { describe, expect, it } from 'vitest';
import { resolveOrderDestination, resolveScenarioLocation } from './scenarioLocations';
import type { ScenarioState } from './types';

const state: ScenarioState = {
  id: 'test',
  name: 'Location resolution test',
  era: 'ww2',
  scale: 'operational',
  turnHours: 6,
  elapsedHours: 0,
  weather: 1,
  terrain: 1,
  intelLevel: 1,
  units: {},
  events: [],
  locations: [{ id: 'bastogne', name: 'Bastogne', position: { lon: 5.71844, lat: 50.003472 } }],
};

describe('scenario location resolution', () => {
  it('resolves a named location case-insensitively', () => {
    expect(resolveScenarioLocation(state, 'bastogne')?.position).toEqual({ lon: 5.71844, lat: 50.003472 });
  });

  it('resolves by stable location id', () => {
    expect(resolveScenarioLocation(state, 'BASTOGNE')?.id).toBe('bastogne');
  });

  it('does not invent a destination for an unknown objective', () => {
    const order = { type: 'move' as const, objective: 'Unknown Place' };
    expect(resolveOrderDestination(state, order)).toEqual(order);
  });

  it('preserves an explicitly supplied destination', () => {
    const order = { type: 'move' as const, objective: 'Bastogne', destination: { lon: 5, lat: 50 } };
    expect(resolveOrderDestination(state, order)).toEqual(order);
  });
});

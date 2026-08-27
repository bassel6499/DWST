import { describe, expect, it } from 'vitest';
import { scenarioToGeoJSON } from './mapState';
import type { ScenarioState } from './types';

const state: ScenarioState = {
  id: 'map-test',
  name: 'Map state test',
  era: 'contemporary',
  scale: 'operational',
  turnHours: 1,
  elapsedHours: 0,
  weather: 1,
  terrain: 1,
  intelLevel: 1,
  units: {
    u1: {
      id: 'u1', name: 'Alpha', side: 'allied', echelon: 'company',
      personnel: 100, equipment: 10, ammunition: 1, fuel: 1,
      readiness: 1, training: 1, experience: 1, morale: 1, cohesion: 1,
      fatigue: 0, wear: 0, logistics: 1, commandQuality: 1, intelligence: 1,
      combatPower: 1, status: 'operational',
      position: { lon: 35.5, lat: 33.9 },
      cumulativeLosses: 0, history: [],
    },
  },
  events: [],
};

describe('scenarioToGeoJSON', () => {
  it('uses the canonical WorldPosition directly for map coordinates', () => {
    const result = scenarioToGeoJSON(state);

    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.coordinates).toEqual([35.5, 33.9]);
  });
});

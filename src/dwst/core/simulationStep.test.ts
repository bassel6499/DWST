import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { ScenarioState } from './types';
import { simulateTurn } from './simulationStep';

const scenario = (): ScenarioState => ({
  id: 'pure-step-test', name: 'Pure step test', era: 'ww2', scale: 'tactical',
  turnHours: 6, elapsedHours: 0, weather: 0, terrain: 0, intelLevel: 0,
  units: {
    a: {
      id:'a', name:'Alpha', side:'allied', echelon:'company', personnel:100,
      equipment:10, ammunition:100, fuel:100, readiness:1, training:0.8,
      experience:0.7, morale:0.9, cohesion:0.9, fatigue:0, wear:0,
      logistics:1, commandQuality:0.8, intelligence:0.5, combatPower:100,
      status:'operational', position:{lon:0,lat:0},
      order:{type:'move',destination:{lon:1,lat:1}}, cumulativeLosses:0, history:[]
    }
  }, events: []
});

describe('pure simulation turn', () => {
  it('does not mutate the supplied scenario', () => {
    const input = scenario();
    const before = structuredClone(input);
    const result = simulateTurn(input);
    assert.deepEqual(input, before);
    assert.notStrictEqual(result.state, input);
    assert.notStrictEqual(result.state.units.a, input.units.a);
  });

  it('is deterministic for identical input and ruleset', () => {
    const first = simulateTurn(scenario());
    const second = simulateTurn(scenario());
    assert.deepEqual(second, first);
  });

  it('returns a report corresponding to the returned next state', () => {
    const result = simulateTurn(scenario());
    assert.equal(result.report.elapsedHours, result.state.elapsedHours);
    assert.equal(result.report.units[0].position.lon, result.state.units.a.position.lon);
    assert.equal(result.report.units[0].position.lat, result.state.units.a.position.lat);
  });
});

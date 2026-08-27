import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { ScenarioState, UnitState } from './types';
import { advanceSimulation, startSimulation } from './simulationSession';

const unit = (personnel: number): UnitState => ({
  id: 'u1', name: 'Alpha', side: 'allied', echelon: 'battalion', personnel,
  equipment: 100, ammunition: 100, fuel: 100, readiness: 1, training: 1,
  experience: 1, morale: 1, cohesion: 1, fatigue: 0, wear: 0, logistics: 1,
  commandQuality: 1, intelligence: 1, combatPower: 100, status: 'operational',
  position: { lon: 0, lat: 0 }, cumulativeLosses: 0, history: [],
});

const scenario = (): ScenarioState => ({
  id: 'session-test', name: 'Session test', era: 'ww2', scale: 'tactical',
  turnHours: 6, elapsedHours: 0, weather: 0, terrain: 0, intelLevel: 1,
  units: { u1: unit(1000) }, events: [],
});

describe('simulation session', () => {
  it('captures T0 once and preserves it across multiple turns', () => {
    const session0 = startSimulation(scenario());
    const first = advanceSimulation(session0);
    const degradedState = {
      ...first.session.state,
      units: {
        ...first.session.state.units,
        u1: { ...first.session.state.units.u1, personnel: 500 },
      },
    };
    const second = advanceSimulation({ ...first.session, state: degradedState });

    assert.equal(session0.baseline.units.u1, 1000);
    assert.strictEqual(first.session.baseline, session0.baseline);
    assert.strictEqual(second.session.baseline, session0.baseline);
    assert.equal(second.session.baseline.units.u1, 1000);
  });

  it('does not mutate the supplied scenario when starting or advancing', () => {
    const input = scenario();
    const before = structuredClone(input);
    const session = startSimulation(input);
    const sessionBefore = structuredClone(session.state);
    advanceSimulation(session);

    assert.deepEqual(input, before);
    assert.deepEqual(session.state, sessionBefore);
  });

  it('uses the preserved baseline for assessment after later turns', () => {
    const session = startSimulation(scenario());
    const first = advanceSimulation(session);
    const degraded = {
      ...first.session.state,
      units: {
        ...first.session.state.units,
        u1: { ...first.session.state.units.u1, personnel: 500 },
      },
    };
    const second = advanceSimulation({ ...first.session, state: degraded });

    assert.equal(second.report.units[0].personnel, 500);
    assert.equal(second.report.units[0].status, 'disorganized');
  });
});

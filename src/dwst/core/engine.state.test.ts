import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { ScenarioState, UnitState } from './types';
import { getEraRuleset } from './eraRules';
import { applyTurn, resolveTurn } from './engine';

const unit = (): UnitState => ({
  id:'u1', name:'Test', side:'allied', echelon:'battalion', personnel:100,
  equipment:100, ammunition:100, fuel:100, readiness:1, training:1,
  experience:1, morale:1, cohesion:1, fatigue:0, wear:0, logistics:1,
  commandQuality:1, intelligence:1, combatPower:100, status:'operational',
  position:{lon:0,lat:0},
  order:{type:'move',destination:{lon:1,lat:1}},
  cumulativeLosses:0, history:[]
});

const scenario = (): ScenarioState => ({
  id:'state-boundary-test', name:'State boundary test', era:'ww2', scale:'tactical',
  turnHours:6, elapsedHours:0, weather:1, terrain:1, intelLevel:1,
  units:{u1:unit()}, events:[]
});

describe('canonical state commit boundary', () => {
  it('resolveTurn does not mutate the supplied state, including nested position/history data', () => {
    const input = scenario();
    const before = structuredClone(input);

    const report = resolveTurn(input, getEraRuleset('ww2'));

    assert.deepEqual(input, before);
    assert.notStrictEqual(report.units[0], input.units.u1);
    assert.notStrictEqual(report.units[0].position, input.units.u1.position);
    assert.notStrictEqual(report.units[0].history, input.units.u1.history);
  });

  it('applyTurn returns the committed next state without mutating the prior state', () => {
    const input = scenario();
    const before = structuredClone(input);
    const report = resolveTurn(input, getEraRuleset('ww2'));

    const next = applyTurn(input, report);

    assert.deepEqual(input, before);
    assert.equal(next.elapsedHours, report.elapsedHours);
    assert.equal(next.units.u1.position.lon, report.units[0].position.lon);
    assert.equal(next.units.u1.position.lat, report.units[0].position.lat);
    assert.notStrictEqual(next.units.u1, input.units.u1);
  });
});

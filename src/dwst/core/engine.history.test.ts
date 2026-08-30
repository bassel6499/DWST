import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { ScenarioState, UnitState } from './types';
import { getEraRuleset } from './eraRules';
import { applyTurn, resolveTurn } from './engine';

const unit = (id: string, side: 'allied' | 'enemy', order?: UnitState['order']): UnitState => ({
  id,
  name: id,
  side,
  echelon: 'battalion',
  personnel: 100,
  equipment: 100,
  ammunition: 100,
  fuel: 100,
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
  position: { lon: 0, lat: 0 },
  order,
  cumulativeLosses: 0,
  history: [],
});

const scenario = (units: Record<string, UnitState>): ScenarioState => ({
  id: 'history-reconciliation-test',
  name: 'History reconciliation test',
  era: 'ww2',
  scale: 'tactical',
  turnHours: 6,
  elapsedHours: 0,
  weather: 1,
  terrain: 1,
  intelLevel: 1,
  units,
  events: [],
});

describe('event and unit-history reconciliation', () => {
  it('records movement events in the affected unit history', () => {
    const input = scenario({
      u1: unit('u1', 'allied', { type: 'move', destination: { lon: 1, lat: 1 } }),
    });

    const report = resolveTurn(input, getEraRuleset('ww2'));
    const movement = report.events.find((event) => event.phase === 'movement');

    assert.ok(movement);
    assert.deepEqual(report.units[0].history, [{
      turn: movement.turn,
      type: 'movement',
      summary: movement.message,
    }]);
  });

  it('records combat history for both participants and reconciles losses', () => {
    const input = scenario({
      attacker: unit('attacker', 'allied', { type: 'attack' }),
      defender: unit('defender', 'enemy'),
    });

    const report = resolveTurn(input, getEraRuleset('ww2'));
    const combat = report.events.find((event) => event.phase === 'combat');

    assert.ok(combat);
    assert.deepEqual([...combat.unitIds].sort(), ['attacker', 'defender']);

    const attacker = report.units.find((candidate) => candidate.id === 'attacker')!;
    const defender = report.units.find((candidate) => candidate.id === 'defender')!;
    const attackerDelta = report.resourceDeltas.find((delta) => delta.unitId === 'attacker')!;
    const defenderDelta = report.resourceDeltas.find((delta) => delta.unitId === 'defender')!;

    assert.equal(attacker.history.at(-1)?.type, 'combat');
    assert.equal(defender.history.at(-1)?.type, 'combat');
    assert.equal(attacker.history.at(-1)?.personnelLosses, -attackerDelta.personnel);
    assert.equal(defender.history.at(-1)?.personnelLosses, -defenderDelta.personnel);
    assert.equal(attacker.history.at(-1)?.equipmentLosses, -attackerDelta.equipment);
    assert.equal(defender.history.at(-1)?.equipmentLosses, -defenderDelta.equipment);
  });

  it('commits the reconciled unit histories together with the scenario events', () => {
    const input = scenario({
      u1: unit('u1', 'allied', { type: 'move', destination: { lon: 1, lat: 1 } }),
    });

    const report = resolveTurn(input, getEraRuleset('ww2'));
    const next = applyTurn(input, report);

    assert.equal(next.events.length, report.events.length);
    assert.equal(next.units.u1.history.length, report.events.filter((event) => event.unitIds.includes('u1')).length);
    assert.deepEqual(input.events, []);
    assert.deepEqual(input.units.u1.history, []);
  });
});

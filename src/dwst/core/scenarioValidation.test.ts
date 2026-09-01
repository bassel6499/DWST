import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { ScenarioState, UnitState } from './types';
import { validateScenario } from './scenarioValidation';
import { startCanonicalSimulation } from './canonicalSimulationSession';
import { getEraRuleset } from './eraRules';

const unit = (id = 'u1'): UnitState => ({
  id, name: id, side: 'allied', echelon: 'battalion',
  personnel: 100, equipment: 10, ammunition: 0.8, fuel: 0.8,
  readiness: 1, training: 1, experience: 1, morale: 1, cohesion: 1,
  fatigue: 0, wear: 0, logistics: 1, commandQuality: 1, intelligence: 1,
  combatPower: 10, status: 'operational', position: { lon: 0, lat: 0 },
  cumulativeLosses: 0, history: [],
});

const scenario = (): ScenarioState => ({
  id: 'validation-test', name: 'Validation test', era: 'ww2', scale: 'tactical',
  turnHours: 6, elapsedHours: 0, weather: 1, terrain: 1, intelLevel: 1,
  units: { u1: unit() }, events: [],
});

const canonical = {
  personnel: { personnel: [] },
  equipment: [],
  crewAssignments: [],
  equipmentDefinitions: [],
  consumables: [{ unitId: 'u1', ammunition: 0.8, fuel: 0.8 }],
};

describe('scenario validation', () => {
  it('accepts the existing runnable WW2 scenario contract', () => {
    assert.deepEqual(validateScenario(scenario()), []);
  });

  it('rejects incomplete unit and scenario structure before simulation', () => {
    const invalid = scenario();
    invalid.id = '';
    invalid.units = {};
    assert.match(validateScenario(invalid).join('\n'), /scenario id must not be empty/);
    assert.match(validateScenario(invalid).join('\n'), /at least one unit/);
  });

  it('rejects invalid spatial, sensor, and hierarchy references', () => {
    const invalid = scenario();
    invalid.units.u1.position = { lon: 181, lat: 0 };
    invalid.units.u1.parentId = 'missing';
    invalid.sensors = [{ id: 's1', unitId: 'missing', type: 'recon', rangeKm: 0, quality: 2 }];
    const errors = validateScenario(invalid).join('\n');
    assert.match(errors, /position is invalid/);
    assert.match(errors, /parentId must reference an existing unit/);
    assert.match(errors, /references unknown unit/);
    assert.match(errors, /rangeKm must be positive/);
    assert.match(errors, /quality must be between 0 and 1/);
  });

  it('rejects invalid scenarios at canonical simulation entry', () => {
    const invalid = scenario();
    invalid.turnHours = 0;
    assert.throws(
      () => startCanonicalSimulation(invalid, canonical, getEraRuleset('ww2')),
      /Scenario .* is not runnable: turnHours must be positive/,
    );
  });

  it('does not treat an unimplemented but structurally valid era as a scenario error', () => {
    const candidate = scenario();
    candidate.era = 'contemporary';
    assert.deepEqual(validateScenario(candidate), []);
    assert.throws(
      () => startCanonicalSimulation(candidate, canonical, getEraRuleset('contemporary')),
      /Era contemporary is not runnable/,
    );
  });
});

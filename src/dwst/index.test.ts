import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import {
  advanceCanonicalSimulation,
  contentHash,
  createReplayProvenance,
  getEraRuleset,
  getImplementedEraRulesets,
  isWorldPosition,
  parseNaturalLanguageOrder,
  resolveOrderDestination,
  scenarioToGeoJSON,
  startCanonicalSimulation,
  validateEraRuleset,
} from './index';
import type { CanonicalState, CombatAllocationPolicy, ScenarioState, UnitState } from './index';

const policy: CombatAllocationPolicy = {
  personnelDisposition: 'killed',
  equipmentDisposition: 'destroyed',
  eligiblePersonnelStatuses: ['assigned'],
  eligibleEquipmentStatuses: ['operational'],
  selection: 'stable-id',
};

const unit = (id: string, side: UnitState['side']): UnitState => ({
  id, name: id, side, echelon: 'battalion', personnel: 2, equipment: 2,
  ammunition: 1, fuel: 1, readiness: 1, training: 1, experience: 1,
  morale: 1, cohesion: 1, fatigue: 0, wear: 0, logistics: 1,
  commandQuality: 1, intelligence: 1, combatPower: 1, status: 'operational',
  position: { lat: 0, lon: 0 }, cumulativeLosses: 0, history: [], order: { type: 'attack' },
});

const scenario = (): ScenarioState => ({
  id: 'public-api-test', name: 'Public API test', era: 'ww2', scale: 'tactical',
  turnHours: 6, elapsedHours: 0, weather: 0, terrain: 0, intelLevel: 1,
  units: { u1: unit('u1', 'allied'), u2: unit('u2', 'enemy') }, events: [],
  locations: [{ id: 'target', name: 'Target', position: { lat: 1, lon: 1 } }],
});

const canonical = (): CanonicalState => ({
  personnel: { personnel: [
    { id: 'u1-p0', unitId: 'u1', status: 'assigned', qualifications: [], experience: {} },
    { id: 'u1-p1', unitId: 'u1', status: 'assigned', qualifications: [], experience: {} },
    { id: 'u2-p0', unitId: 'u2', status: 'assigned', qualifications: [], experience: {} },
    { id: 'u2-p1', unitId: 'u2', status: 'assigned', qualifications: [], experience: {} },
  ] },
  equipment: [
    { instanceId: 'u1-e0', definitionId: 'eq', unitId: 'u1', status: 'operational' },
    { instanceId: 'u1-e1', definitionId: 'eq', unitId: 'u1', status: 'operational' },
    { instanceId: 'u2-e0', definitionId: 'eq', unitId: 'u2', status: 'operational' },
    { instanceId: 'u2-e1', definitionId: 'eq', unitId: 'u2', status: 'operational' },
  ],
  crewAssignments: [],
  equipmentDefinitions: [],
  consumables: [
    { unitId: 'u1', ammunition: 1, fuel: 1 },
    { unitId: 'u2', ammunition: 1, fuel: 1 },
  ],
});

describe('public DWST API boundary', () => {
  it('exports the canonical session entry points and stable contracts', () => {
    assert.equal(typeof startCanonicalSimulation, 'function');
    assert.equal(typeof advanceCanonicalSimulation, 'function');
    assert.equal(typeof getEraRuleset, 'function');
    assert.equal(typeof getImplementedEraRulesets, 'function');
    assert.equal(typeof validateEraRuleset, 'function');
    assert.equal(typeof parseNaturalLanguageOrder, 'function');
    assert.equal(typeof resolveOrderDestination, 'function');
    assert.equal(typeof scenarioToGeoJSON, 'function');
    assert.equal(typeof isWorldPosition, 'function');
    assert.equal(typeof contentHash, 'function');
    assert.equal(typeof createReplayProvenance, 'function');
  });

  it('runs the canonical session through the public entry point', () => {
    const session = startCanonicalSimulation(scenario(), canonical());
    const result = advanceCanonicalSimulation(session, policy);
    assert.equal(result.session.provenance.modelVersion, 'dwst-core-v1');
    assert.equal(result.session.state.elapsedHours, 6);
  });

  it('keeps scenario/objective helpers available without deep Core imports', () => {
    const state = scenario();
    const order = resolveOrderDestination(state, { type: 'move', objective: 'Target' });
    assert.deepEqual(order.destination, { lat: 1, lon: 1 });
    assert.equal(isWorldPosition(order.destination), true);
  });
});

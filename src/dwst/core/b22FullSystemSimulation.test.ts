import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { CanonicalState } from './canonicalState';
import type { ScenarioState, UnitState } from './types';
import { advanceCanonicalSimulation, startCanonicalSimulation, type CanonicalSimulationSession } from './canonicalSimulationSession';
import type { CombatAllocationPolicy } from './canonicalCombatAllocation';
import { getRulesetContentHash } from './replayProvenance';
import { getEraRuleset } from './eraRules';

const policy: CombatAllocationPolicy = {
  personnelDisposition: 'killed',
  equipmentDisposition: 'destroyed',
  eligiblePersonnelStatuses: ['assigned'],
  eligibleEquipmentStatuses: ['operational'],
  selection: 'stable-id',
};

const unit = (id: string, side: UnitState['side']): UnitState => ({
  id, name: id, side, echelon: 'battalion', personnel: 100, equipment: 20,
  ammunition: 0.5, fuel: 0.5, readiness: 1, training: 1, experience: 1,
  morale: 1, cohesion: 1, fatigue: 0, wear: 0, logistics: 1,
  commandQuality: 1, intelligence: 1, combatPower: 100, status: 'operational',
  position: { lat: 0, lon: 0 }, cumulativeLosses: 0, history: [],
  order: { type: 'attack', destination: { lat: 0.01, lon: 0 } },
});

const scenario = (): ScenarioState => ({
  id: 'b22-full-system', name: 'B22 full-system integration fixture', era: 'ww2', scale: 'tactical',
  turnHours: 6, elapsedHours: 0, weather: 0, terrain: 0, intelLevel: 1,
  units: { u1: unit('u1', 'allied'), u2: unit('u2', 'enemy') }, events: [],
  sensors: [
    { id: 's1', unitId: 'u1', type: 'visual', rangeKm: 20, quality: 1 },
    { id: 's2', unitId: 'u2', type: 'visual', rangeKm: 20, quality: 1 },
  ],
});

const canonical = (): CanonicalState => ({
  personnel: { personnel: [
    ...Array.from({ length: 100 }, (_, i) => ({ id: `p1-${i}`, unitId: 'u1', status: 'assigned' as const, qualifications: [], experience: {} })),
    ...Array.from({ length: 100 }, (_, i) => ({ id: `p2-${i}`, unitId: 'u2', status: 'assigned' as const, qualifications: [], experience: {} })),
  ] },
  equipment: [
    ...Array.from({ length: 20 }, (_, i) => ({ instanceId: `e1-${i}`, definitionId: 'eq', unitId: 'u1', status: 'operational' as const })),
    ...Array.from({ length: 20 }, (_, i) => ({ instanceId: `e2-${i}`, definitionId: 'eq', unitId: 'u2', status: 'operational' as const })),
  ],
  crewAssignments: [],
  equipmentDefinitions: [{ id: 'eq', name: 'B22 test vehicle', era: 'WWII', equipmentType: 'tank', crewRequirementId: 'WWII:tank:tankCrew' }],
  consumables: [{ unitId: 'u1', ammunition: 0.5, fuel: 0.5 }, { unitId: 'u2', ammunition: 0.5, fuel: 0.5 }],
});

const assertCanonicalProjection = (session: CanonicalSimulationSession): void => {
  for (const unit of Object.values(session.state.units)) {
    const personnel = session.canonical.personnel.personnel.filter((record) => record.unitId === unit.id && record.status === 'assigned').length;
    const equipment = session.canonical.equipment.filter((instance) => instance.unitId === unit.id && instance.status === 'operational').length;
    const consumables = session.canonical.consumables.find((record) => record.unitId === unit.id);
    assert.ok(consumables);
    assert.equal(unit.personnel, personnel);
    assert.equal(unit.equipment, equipment);
    assert.equal(unit.ammunition, consumables.ammunition);
    assert.equal(unit.fuel, consumables.fuel);
  }
};

const runScenario = (input = scenario(), sourceCanonical = canonical()): CanonicalSimulationSession => {
  let session = startCanonicalSimulation(input, sourceCanonical);
  assert.equal(session.rules.id, 'ww2');
  assert.equal(session.provenance.rulesetContentHash, getRulesetContentHash(getEraRuleset('ww2')));
  for (let i = 0; i < 5; i += 1) {
    const previousElapsedHours = session.state.elapsedHours;
    const result = advanceCanonicalSimulation(session, policy);
    session = result.session;
    assert.equal(result.report.turn, i + 1);
    assert.equal(session.state.elapsedHours, previousElapsedHours + session.state.turnHours);
    assertCanonicalProjection(session);
    assert.ok(session.provenance.commands.length >= (i + 1) * 2);
    assert.ok(result.report.events.length > 0);
    assert.ok(result.report.resourceDeltas.length > 0);
  }
  return session;
};

describe('B22 full-system simulation', () => {
  it('runs a representative five-turn scenario through the complete canonical pipeline', () => {
    const input = scenario();
    const sourceCanonical = canonical();
    const inputBefore = structuredClone(input);
    const canonicalBefore = structuredClone(sourceCanonical);
    const session = runScenario(input, sourceCanonical);
    assertCanonicalProjection(session);
    assert.equal(session.provenance.commands.length, 10);
    assert.deepEqual(session.provenance.commands.map((command) => command.sequence), Array.from({ length: 10 }, (_, index) => index));
    assert.equal(session.provenance.rulesetContentHash, getRulesetContentHash(getEraRuleset('ww2')));
    assert.ok(session.state.events.some((event) => event.phase === 'movement'));
    assert.ok(session.state.events.some((event) => event.phase === 'combat'));
    assert.deepEqual(input, inputBefore);
    assert.deepEqual(sourceCanonical, canonicalBefore);
  });

  it('produces the same final authoritative result when the fixture is run twice', () => {
    const first = runScenario();
    const second = runScenario();
    assert.deepEqual(first.state, second.state);
    assert.deepEqual(first.canonical, second.canonical);
    assert.deepEqual(first.provenance, second.provenance);
  });
});

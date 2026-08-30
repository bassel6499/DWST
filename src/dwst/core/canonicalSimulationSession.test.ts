import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { CanonicalState } from './canonicalState';
import type { ScenarioState, UnitState } from './types';
import { advanceCanonicalSimulation, startCanonicalSimulation } from './canonicalSimulationSession';
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
  id, name: id, side, echelon: 'battalion', personnel: 10, equipment: 10,
  ammunition: 1, fuel: 1, readiness: 1, training: 1, experience: 1,
  morale: 1, cohesion: 1, fatigue: 0, wear: 0, logistics: 1,
  commandQuality: 1, intelligence: 1, combatPower: 100, status: 'operational',
  position: { lat: 0, lon: 0 }, cumulativeLosses: 0, history: [],
  order: { type: 'attack' },
});

const scenario = (): ScenarioState => ({
  id: 'canonical-session-test', name: 'Canonical session test', era: 'ww2', scale: 'tactical',
  turnHours: 6, elapsedHours: 0, weather: 0, terrain: 0, intelLevel: 1,
  units: { u1: unit('u1', 'allied'), u2: unit('u2', 'enemy') }, events: [],
});

const canonical = (): CanonicalState => ({
  personnel: { personnel: [
    ...Array.from({ length: 10 }, (_, i) => ({ id: `p1-${i}`, unitId: 'u1', status: 'assigned' as const, qualifications: [], experience: {} })),
    ...Array.from({ length: 10 }, (_, i) => ({ id: `p2-${i}`, unitId: 'u2', status: 'assigned' as const, qualifications: [], experience: {} })),
  ] },
  equipment: [
    ...Array.from({ length: 10 }, (_, i) => ({ instanceId: `e1-${i}`, definitionId: 'eq', unitId: 'u1', status: 'operational' as const })),
    ...Array.from({ length: 10 }, (_, i) => ({ instanceId: `e2-${i}`, definitionId: 'eq', unitId: 'u2', status: 'operational' as const })),
  ],
  crewAssignments: [],
  equipmentDefinitions: [{ id: 'eq', name: 'WWII tank', era: 'WWII', equipmentType: 'tank', crewRequirementId: 'WWII:tank:tankCrew' }],
  consumables: [
    { unitId: 'u1', ammunition: 1, fuel: 1 },
    { unitId: 'u2', ammunition: 1, fuel: 1 },
  ],
});

describe('canonical simulation session', () => {
  it('projects canonical resources at T0 and preserves operational state', () => {
    const input = scenario();
    const session = startCanonicalSimulation(input, canonical());
    assert.equal(session.state.units.u1.personnel, 10);
    assert.equal(session.state.units.u1.equipment, 10);
    assert.equal(session.state.units.u1.ammunition, 1);
    assert.equal(session.state.units.u1.fuel, 1);
    assert.equal(session.state.units.u1.position.lat, 0);
    assert.equal(session.canonical.personnel.personnel.length, 20);
    assert.equal(session.canonical.consumables.length, 2);
    assert.equal(session.provenance.rulesetId, 'ww2');
    assert.equal(session.provenance.rng, null);
    assert.equal(session.provenance.rulesetContentHash, getRulesetContentHash(getEraRuleset('ww2')));
    assert.equal(session.provenance.commands.length, 0);
    assert.notStrictEqual(session.state, input);
  });

  it('records an ordered command journal without changing turn resolution', () => {
    const session = startCanonicalSimulation(scenario(), canonical());
    const result = advanceCanonicalSimulation(session, policy);
    assert.equal(result.session.provenance.commands.length, 2);
    assert.deepEqual(result.session.provenance.commands.map((command) => command.sequence), [0, 1]);
    assert.deepEqual(result.session.provenance.commands.map((command) => command.unitId), ['u1', 'u2']);
    assert.ok(result.session.provenance.commands.every((command) => command.turn === result.report.turn));
    assert.equal(result.session.provenance.commands[0].order?.type, 'attack');
  });

  it('preserves provenance identity across turns and journal ordering', () => {
    const session = startCanonicalSimulation(scenario(), canonical());
    const first = advanceCanonicalSimulation(session, policy).session;
    const second = advanceCanonicalSimulation(first, policy).session;
    assert.equal(first.provenance.rulesetContentHash, second.provenance.rulesetContentHash);
    assert.equal(first.provenance.modelVersion, second.provenance.modelVersion);
    assert.equal(first.provenance.commands.length, 2);
    assert.equal(second.provenance.commands.length, 4);
    assert.deepEqual(first.provenance.commands.map((command) => command.sequence), [0, 1]);
    assert.deepEqual(second.provenance.commands.map((command) => command.sequence), [0, 1, 2, 3]);
  });

  it('uses canonical records as the post-turn resource authority', () => {
    const session = startCanonicalSimulation(scenario(), canonical());
    const result = advanceCanonicalSimulation(session, policy);

    for (const unit of result.report.units) {
      const canonicalPersonnel = result.session.canonical.personnel.personnel
        .filter((record) => record.unitId === unit.id && record.status === 'assigned').length;
      const canonicalEquipment = result.session.canonical.equipment
        .filter((instance) => instance.unitId === unit.id && instance.status === 'operational').length;
      const canonicalConsumables = result.session.canonical.consumables.find((record) => record.unitId === unit.id);
      assert.ok(canonicalConsumables);
      assert.equal(unit.personnel, canonicalPersonnel);
      assert.equal(unit.equipment, canonicalEquipment);
      assert.equal(unit.ammunition, canonicalConsumables.ammunition);
      assert.equal(unit.fuel, canonicalConsumables.fuel);
    }

    const totalKilled = result.session.canonical.personnel.personnel
      .filter((record) => record.status === 'killed').length;
    const totalDestroyed = result.session.canonical.equipment
      .filter((instance) => instance.status === 'destroyed').length;
    assert.equal(totalKilled, 20 - result.report.units.reduce((sum, unit) => sum + unit.personnel, 0));
    assert.equal(totalDestroyed, 20 - result.report.units.reduce((sum, unit) => sum + unit.equipment, 0));
    assert.equal(result.session.state.units.u1.fuel, result.session.canonical.consumables.find((record) => record.unitId === 'u1')?.fuel);
  });

  it('does not mutate the original canonical state or scenario', () => {
    const input = scenario();
    const sourceCanonical = canonical();
    const inputBefore = structuredClone(input);
    const canonicalBefore = structuredClone(sourceCanonical);
    const session = startCanonicalSimulation(input, sourceCanonical);
    advanceCanonicalSimulation(session, policy);

    assert.deepEqual(input, inputBefore);
    assert.deepEqual(sourceCanonical, canonicalBefore);
  });
});

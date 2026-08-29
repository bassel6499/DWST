import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { CanonicalState } from './canonicalState';
import type { ScenarioState, UnitState } from './types';
import { advanceCanonicalSimulation, startCanonicalSimulation } from './canonicalSimulationSession';
import type { CombatAllocationPolicy } from './canonicalCombatAllocation';

const policy: CombatAllocationPolicy = {
  personnelDisposition: 'killed',
  equipmentDisposition: 'destroyed',
  eligiblePersonnelStatuses: ['assigned'],
  eligibleEquipmentStatuses: ['operational'],
  selection: 'stable-id',
};

const unit = (id: string, side: UnitState['side']): UnitState => ({
  id, name: id, side, echelon: 'battalion', personnel: 10, equipment: 10,
  ammunition: 100, fuel: 100, readiness: 1, training: 1, experience: 1,
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
  equipmentDefinitions: [],
});

describe('canonical simulation session', () => {
  it('projects canonical resources at T0 and preserves operational state', () => {
    const input = scenario();
    const session = startCanonicalSimulation(input, canonical());
    assert.equal(session.state.units.u1.personnel, 10);
    assert.equal(session.state.units.u1.equipment, 10);
    assert.equal(session.state.units.u1.position.lat, 0);
    assert.equal(session.canonical.personnel.personnel.length, 20);
    assert.notStrictEqual(session.state, input);
  });

  it('uses canonical records as the post-turn resource authority', () => {
    const session = startCanonicalSimulation(scenario(), canonical());
    const result = advanceCanonicalSimulation(session, policy);

    for (const unit of result.report.units) {
      const canonicalPersonnel = result.session.canonical.personnel.personnel
        .filter((record) => record.unitId === unit.id && record.status === 'assigned').length;
      const canonicalEquipment = result.session.canonical.equipment
        .filter((instance) => instance.unitId === unit.id && instance.status === 'operational').length;
      assert.equal(unit.personnel, canonicalPersonnel);
      assert.equal(unit.equipment, canonicalEquipment);
    }

    const totalKilled = result.session.canonical.personnel.personnel
      .filter((record) => record.status === 'killed').length;
    const totalDestroyed = result.session.canonical.equipment
      .filter((instance) => instance.status === 'destroyed').length;
    assert.equal(totalKilled, 20 - result.report.units.reduce((sum, unit) => sum + unit.personnel, 0));
    assert.equal(totalDestroyed, 20 - result.report.units.reduce((sum, unit) => sum + unit.equipment, 0));
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

import { describe, expect, it } from 'vitest';
import type { CanonicalState } from './canonicalState';
import { allocateCombatLosses } from './canonicalCombatAllocation';

const state: CanonicalState = {
  personnel: {
    personnel: [
      { id: 'p3', unitId: 'u1', status: 'assigned', qualifications: [], experience: {} },
      { id: 'p1', unitId: 'u1', status: 'assigned', qualifications: [], experience: {} },
      { id: 'p2', unitId: 'u1', status: 'wounded', qualifications: [], experience: {} },
      { id: 'p4', unitId: 'u2', status: 'assigned', qualifications: [], experience: {} },
    ],
  },
  equipment: [
    { instanceId: 'e2', definitionId: 'tank', unitId: 'u1', status: 'operational' },
    { instanceId: 'e1', definitionId: 'tank', unitId: 'u1', status: 'operational' },
    { instanceId: 'e3', definitionId: 'tank', unitId: 'u1', status: 'damaged' },
    { instanceId: 'e4', definitionId: 'tank', unitId: 'u2', status: 'operational' },
  ],
  crewAssignments: [],
  equipmentDefinitions: [],
};

const policy = {
  personnelDisposition: 'killed' as const,
  equipmentDisposition: 'destroyed' as const,
  eligiblePersonnelStatuses: ['assigned'] as const,
  eligibleEquipmentStatuses: ['operational'] as const,
  selection: 'stable-id' as const,
};

describe('deterministic canonical combat allocation', () => {
  it('selects only eligible records from the specified unit in stable ID order', () => {
    const commit = allocateCombatLosses(state, 'u1', { personnel: 2, equipment: 1 }, policy);

    expect(commit.personnel).toEqual([
      { personnelId: 'p1', disposition: 'killed' },
      { personnelId: 'p3', disposition: 'killed' },
    ]);
    expect(commit.equipment).toEqual([
      { instanceId: 'e1', disposition: 'destroyed' },
    ]);
  });

  it('is deterministic regardless of source-record ordering', () => {
    const reordered: CanonicalState = {
      ...state,
      personnel: { personnel: [...state.personnel.personnel].reverse() },
      equipment: [...state.equipment].reverse(),
    };

    expect(allocateCombatLosses(state, 'u1', { personnel: 1, equipment: 2 }, policy))
      .toEqual(allocateCombatLosses(reordered, 'u1', { personnel: 1, equipment: 2 }, policy));
  });

  it('rejects losses that exceed explicitly eligible resources', () => {
    expect(() => allocateCombatLosses(state, 'u1', { personnel: 3, equipment: 0 }, policy))
      .toThrow('Personnel loss allocation exceeds eligible personnel for unit u1');
    expect(() => allocateCombatLosses(state, 'u1', { personnel: 0, equipment: 3 }, policy))
      .toThrow('Equipment loss allocation exceeds eligible equipment for unit u1');
  });

  it('rejects invalid aggregate loss counts', () => {
    expect(() => allocateCombatLosses(state, 'u1', { personnel: -1, equipment: 0 }, policy))
      .toThrow('Personnel losses must be a non-negative integer');
    expect(() => allocateCombatLosses(state, 'u1', { personnel: 1.5, equipment: 0 }, policy))
      .toThrow('Personnel losses must be a non-negative integer');
  });
});

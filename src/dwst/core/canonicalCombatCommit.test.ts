import { describe, expect, it } from 'vitest';
import type { CanonicalState } from './canonicalState';
import { commitCombatResourceChanges } from './canonicalCombatCommit';

const state: CanonicalState = {
  personnel: {
    personnel: [
      { id: 'p1', unitId: 'u1', status: 'assigned', qualifications: ['rifle'], experience: {} },
      { id: 'p2', unitId: 'u1', status: 'assigned', qualifications: ['rifle'], experience: {} },
    ],
  },
  equipment: [
    { instanceId: 'e1', definitionId: 'rifle', unitId: 'u1', status: 'operational' },
  ],
  crewAssignments: [],
  equipmentDefinitions: [],
  consumables: [{ unitId: 'u1', ammunition: 1, fuel: 1 }],
};

describe('canonical combat commit', () => {
  it('applies explicit personnel and equipment dispositions without inventing identities', () => {
    const next = commitCombatResourceChanges(state, {
      personnel: [{ personnelId: 'p2', disposition: 'wounded' }],
      equipment: [{ instanceId: 'e1', disposition: 'damaged' }],
    });

    expect(next.personnel.personnel.map((p) => [p.id, p.status])).toEqual([
      ['p1', 'assigned'],
      ['p2', 'wounded'],
    ]);
    expect(next.equipment[0].status).toBe('damaged');
    expect(state.personnel.personnel[1].status).toBe('assigned');
    expect(state.equipment[0].status).toBe('operational');
  });

  it('rejects duplicate and unknown canonical record allocations', () => {
    expect(() => commitCombatResourceChanges(state, {
      personnel: [
        { personnelId: 'p1', disposition: 'killed' },
        { personnelId: 'p1', disposition: 'missing' },
      ],
      equipment: [],
    })).toThrow('Duplicate personnel loss allocation: p1');

    expect(() => commitCombatResourceChanges(state, {
      personnel: [{ personnelId: 'unknown', disposition: 'killed' }],
      equipment: [],
    })).toThrow('Unknown personnel loss allocation: unknown');
  });
});

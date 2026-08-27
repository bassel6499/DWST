import { describe, expect, it } from 'vitest';
import { projectCanonicalUnitResources } from './canonicalUnitAdapter';
import type { CanonicalState } from './canonicalState';

const canonicalState: CanonicalState = {
  personnel: {
    personnel: [
      { id: 'p1', unitId: 'u1', status: 'assigned', qualifications: ['tank'], experience: {} },
      { id: 'p2', unitId: 'u1', status: 'assigned', qualifications: ['tank'], experience: {} },
    ],
  },
  equipment: [
    { instanceId: 'e1', definitionId: 'tank', unitId: 'u1', status: 'operational' },
    { instanceId: 'e2', definitionId: 'tank', unitId: 'u1', status: 'damaged' },
  ],
  crewAssignments: [
    { instanceId: 'e1', slot: 1, personnelId: 'p1', specialty: 'tank' },
    { instanceId: 'e1', slot: 2, personnelId: 'p2', specialty: 'tank' },
  ],
  equipmentDefinitions: [
    { id: 'tank', name: 'Tank', era: 'modern', equipmentType: 'armour', crewRequirementId: 'tankCrew' },
  ],
};

describe('projectCanonicalUnitResources', () => {
  it('keeps equipment readiness separate from UnitState.readiness', () => {
    const result = projectCanonicalUnitResources('u1', canonicalState);
    expect(result.equipmentReadiness).toBe(1);
    expect(result).not.toHaveProperty('readiness');
  });

  it('does not mutate canonical state', () => {
    const before = JSON.stringify(canonicalState);
    projectCanonicalUnitResources('u1', canonicalState);
    expect(JSON.stringify(canonicalState)).toBe(before);
  });
});

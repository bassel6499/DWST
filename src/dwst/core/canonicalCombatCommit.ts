import type { CanonicalState } from './canonicalState';

export type CombatPersonnelDisposition = 'wounded' | 'killed' | 'missing';
export type CombatEquipmentDisposition = 'damaged' | 'destroyed' | 'missing';

export interface PersonnelLossAllocation {
  personnelId: string;
  disposition: CombatPersonnelDisposition;
}

export interface EquipmentLossAllocation {
  instanceId: string;
  disposition: CombatEquipmentDisposition;
}

export interface CanonicalCombatCommit {
  personnel: PersonnelLossAllocation[];
  equipment: EquipmentLossAllocation[];
}

/**
 * Apply an already-allocated combat loss to authoritative records.
 *
 * Allocation is deliberately separate from combat resolution: this function
 * never invents casualty identities or dispositions. The caller must provide
 * explicit canonical record IDs and dispositions.
 */
export function commitCombatResourceChanges(
  state: CanonicalState,
  commit: CanonicalCombatCommit,
): CanonicalState {
  const personnelIds = new Set<string>();
  for (const loss of commit.personnel) {
    if (personnelIds.has(loss.personnelId)) {
      throw new Error(`Duplicate personnel loss allocation: ${loss.personnelId}`);
    }
    personnelIds.add(loss.personnelId);
  }

  const equipmentIds = new Set<string>();
  for (const loss of commit.equipment) {
    if (equipmentIds.has(loss.instanceId)) {
      throw new Error(`Duplicate equipment loss allocation: ${loss.instanceId}`);
    }
    equipmentIds.add(loss.instanceId);
  }

  const personnel = state.personnel.personnel.map((record) => {
    const allocation = commit.personnel.find((loss) => loss.personnelId === record.id);
    return allocation ? { ...record, status: allocation.disposition } : { ...record, experience: { ...record.experience }, qualifications: [...record.qualifications] };
  });

  for (const loss of commit.personnel) {
    if (!state.personnel.personnel.some((record) => record.id === loss.personnelId)) {
      throw new Error(`Unknown personnel loss allocation: ${loss.personnelId}`);
    }
  }

  const equipment = state.equipment.map((instance) => {
    const allocation = commit.equipment.find((loss) => loss.instanceId === instance.instanceId);
    return allocation ? { ...instance, status: allocation.disposition } : { ...instance };
  });

  for (const loss of commit.equipment) {
    if (!state.equipment.some((instance) => instance.instanceId === loss.instanceId)) {
      throw new Error(`Unknown equipment loss allocation: ${loss.instanceId}`);
    }
  }

  return {
    ...state,
    personnel: { personnel },
    equipment,
    crewAssignments: state.crewAssignments.map((assignment) => ({ ...assignment })),
    equipmentDefinitions: state.equipmentDefinitions.map((definition) => ({ ...definition })),
  };
}

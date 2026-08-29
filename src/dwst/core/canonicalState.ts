import type { EquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';
import type { PersonnelRegistry } from './personnelRegistry';
import type { CanonicalConsumableState } from './canonicalConsumables';

/** Canonical resource state. Individual records and unit-owned consumables are authoritative here. */
export interface CanonicalState {
  personnel: PersonnelRegistry;
  equipment: EquipmentInstance[];
  crewAssignments: InstanceCrewAssignment[];
  equipmentDefinitions: EquipmentDefinition[];
  consumables: CanonicalConsumableState[];
}

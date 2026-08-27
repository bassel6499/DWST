import type { EquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';
import type { PersonnelRegistry } from './personnelRegistry';

/** Canonical resource state. Individual personnel/equipment records are authoritative here. */
export interface CanonicalState {
  personnel:PersonnelRegistry;
  equipment:EquipmentInstance[];
  crewAssignments:InstanceCrewAssignment[];
  equipmentDefinitions:EquipmentDefinition[];
}

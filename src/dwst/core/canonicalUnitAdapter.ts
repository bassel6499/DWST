import type { EquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';
import type { PersonnelRegistry } from './personnelRegistry';
import { projectCanonicalUnit } from './canonicalProjection';

export interface CanonicalUnitResourcePatch {
  personnel:number;
  equipment:number;
  readiness:number;
}

/**
 * Pure adapter from authoritative canonical resources to the resource fields
 * already consumed by UnitState. It does not mutate canonical state or any
 * UnitState object, and it does not synthesize individual resources.
 */
export function projectCanonicalUnitResources(
 unitId:string,
 registry:PersonnelRegistry,
 instances:EquipmentInstance[],
 assignments:InstanceCrewAssignment[],
 definitions:EquipmentDefinition[],
):CanonicalUnitResourcePatch{
 const projection=projectCanonicalUnit(unitId,registry,instances,assignments,definitions);
 const readiness=projection.equipmentOperational===0
  ? 0
  : projection.equipmentReady/projection.equipmentOperational;
 return {
  personnel:projection.personnel,
  equipment:projection.equipment,
  readiness:Math.max(0,Math.min(1,readiness)),
 };
}

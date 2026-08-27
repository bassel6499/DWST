import type { EquipmentDefinition } from './equipmentCatalog';
import { resolveCrewRequirement } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { PersonnelRegistry } from './personnelRegistry';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';

export interface EquipmentReadinessSummary { definitionId:string; operational:number; crewReady:number; combatReady:number; uncrewed:number; }

/** Pure projection. Crew requirement is resolved from the authoritative equipment data contract. */
export function projectEquipmentPoolReadiness(definition:EquipmentDefinition,instances:EquipmentInstance[],assignments:InstanceCrewAssignment[],registry:PersonnelRegistry):EquipmentReadinessSummary {
 const requirement=resolveCrewRequirement(definition);
 const relevant=instances.filter(i=>i.definitionId===definition.id);
 const operational=relevant.filter(i=>i.status==='operational');
 const personnelById=new Map(registry.personnel.map(p=>[p.id,p]));
 let crewReady=0;
 for(const instance of operational){
  const assigned=new Set(assignments.filter(a=>a.instanceId===instance.instanceId&&a.specialty===requirement.specialty).map(a=>a.personnelId));
  const qualified=[...assigned].filter(id=>{const p=personnelById.get(id);return !!p&&p.status==='assigned'&&p.qualifications.includes(requirement.specialty);}).length;
  if(qualified>=requirement.requiredQualifiedCrew) crewReady++;
 }
 return {definitionId:definition.id,operational:operational.length,crewReady,combatReady:crewReady,uncrewed:operational.length-crewReady};
}

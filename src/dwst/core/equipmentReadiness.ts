import type { EquipmentDefinition } from './equipmentCatalog';
import { resolveCrewRequirement } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { PersonnelRegistry } from './personnelRegistry';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';

export interface EquipmentReadinessSummary { definitionId:string; operational:number; crewReady:number; combatReady:number; uncrewed:number; }

/** Pure projection. Each personnel identity can contribute to at most one equipment instance. */
export function projectEquipmentReadiness(definition:EquipmentDefinition,instances:EquipmentInstance[],assignments:InstanceCrewAssignment[],registry:PersonnelRegistry):EquipmentReadinessSummary {
 const requirement=resolveCrewRequirement(definition);
 const relevant=instances.filter(i=>i.definitionId===definition.id);
 const operational=relevant.filter(i=>i.status==='operational');
 const personnelById=new Map(registry.personnel.map(p=>[p.id,p]));
 const globallyUsedPersonnel=new Set<string>();
 let crewReady=0;
 for(const instance of operational){
  const assigned=new Set<string>();
  for(const a of assignments){
   if(a.instanceId!==instance.instanceId||a.specialty!==requirement.specialty||assigned.has(a.personnelId)||globallyUsedPersonnel.has(a.personnelId)) continue;
   const p=personnelById.get(a.personnelId);
   if(!p||p.status!=='assigned'||!p.qualifications.includes(requirement.specialty)) continue;
   assigned.add(a.personnelId);
   globallyUsedPersonnel.add(a.personnelId);
  }
  if(assigned.size>=requirement.requiredQualifiedCrew) crewReady++;
 }
 return {definitionId:definition.id,operational:operational.length,crewReady,combatReady:crewReady,uncrewed:operational.length-crewReady};
}

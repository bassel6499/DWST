import type { PersonnelRegistry } from './personnelRegistry';
import type { EquipmentDefinition } from './equipmentCatalog';
import { resolveCrewRequirement } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';

export interface EquipmentReadiness { equipmentId:string; operational:number; crewReady:number; crewShort:number; usable:number; }

/** Canonical readiness for one equipment instance. Personnel contribute only when actually assigned to this instance. */
export function projectInstanceEquipmentReadiness(
 instance:EquipmentInstance,
 assignments:InstanceCrewAssignment[],
 registry:PersonnelRegistry,
 definition:EquipmentDefinition,
):EquipmentReadiness {
 const requirement=resolveCrewRequirement(definition);
 const instanceAssignments=assignments.filter(a=>a.instanceId===instance.instanceId);
 const uniquePersonnel=new Set<string>();
 let crewReady=0;
 for(const assignment of instanceAssignments){
  if(uniquePersonnel.has(assignment.personnelId)) continue;
  uniquePersonnel.add(assignment.personnelId);
  const p=registry.personnel.find(x=>x.id===assignment.personnelId);
  if(p && p.status==='assigned' && p.qualifications.includes(requirement.specialty) && assignment.specialty===requirement.specialty) crewReady++;
 }
 const operational=instance.status==='operational'?1:0;
 const usable=operational===1 && crewReady>=requirement.requiredQualifiedCrew ? 1 : 0;
 return {equipmentId:instance.instanceId,operational,crewReady,crewShort:Math.max(0,requirement.requiredQualifiedCrew-crewReady),usable};
}
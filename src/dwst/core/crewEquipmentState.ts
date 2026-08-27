import type { EquipmentLedger, EquipmentCrewLink, SpecialistPool } from './canonicalLedger';
import type { PersonnelRegistry } from './personnelRegistry';
import type { EquipmentDefinition } from './equipmentCatalog';
import { resolveCrewRequirement } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';

export interface EquipmentReadiness { equipmentId:string; operational:number; crewReady:number; crewShort:number; usable:number; }

/**
 * Aggregate/legacy projection. This intentionally uses SpecialistPool because
 * aggregate-only scenarios do not have individual equipment assignments.
 */
export function projectEquipmentReadiness(equipment:EquipmentLedger,link:EquipmentCrewLink,registry:PersonnelRegistry,pool:SpecialistPool):EquipmentReadiness {
 const liveQualified=(pool.personnelIds ?? []).filter(id=>{
  const p=registry.personnel.find(x=>x.id===id);
  return !!p && (p.status==='available'||p.status==='assigned') && p.qualifications.includes(link.crewSpecialty);
 }).length;
 const usable=Math.min(equipment.operational,Math.floor(liveQualified/link.requiredQualifiedCrew));
 return {equipmentId:equipment.designation,operational:equipment.operational,crewReady:liveQualified,crewShort:Math.max(0,equipment.operational*link.requiredQualifiedCrew-liveQualified),usable};
}

/**
 * Canonical readiness for one equipment instance.
 * Personnel contribute only when actually assigned to this instance.
 * PersonnelRegistry remains authoritative for status and qualification.
 */
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
  if(p && p.status==='assigned' && p.qualifications.includes(requirement.specialty) && assignment.specialty===requirement.specialty){
   crewReady++;
  }
 }
 const operational=instance.status==='operational'?1:0;
 const usable=operational===1 && crewReady>=requirement.requiredQualifiedCrew ? 1 : 0;
 return {
  equipmentId:instance.instanceId,
  operational,
  crewReady,
  crewShort:Math.max(0,requirement.requiredQualifiedCrew-crewReady),
  usable,
 };
}

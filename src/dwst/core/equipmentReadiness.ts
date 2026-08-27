import type { EquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { PersonnelRegistry } from './personnelRegistry';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';

export interface EquipmentReadinessSummary { definitionId:string; operational:number; crewReady:number; combatReady:number; uncrewed:number; }

/** Pure projection. Crew specialty is resolved from the equipment definition, not hard-coded by domain. */
export function projectEquipmentPoolReadiness(definition:EquipmentDefinition,instances:EquipmentInstance[],assignments:InstanceCrewAssignment[],registry:PersonnelRegistry):EquipmentReadinessSummary {
 const relevant=instances.filter(i=>i.definitionId===definition.id);
 const operational=relevant.filter(i=>i.status==='operational');
 const personnelById=new Map(registry.personnel.map(p=>[p.id,p]));
 const specialty=definition.crewRequirementId.split(':')[2];
 const requirementCrew=Number.NaN;
 let crewReady=0;
 for(const instance of operational){
  const assigned=new Set(assignments.filter(a=>a.instanceId===instance.instanceId&&a.specialty===specialty).map(a=>a.personnelId));
  const qualified=[...assigned].filter(id=>{const p=personnelById.get(id);return !!p&&p.status==='assigned'&&p.qualifications.includes(specialty);}).length;
  const required=Number.isFinite(requirementCrew)?requirementCrew:new Set(assignments.filter(a=>a.instanceId===instance.instanceId&&a.specialty===specialty).map(a=>a.slot)).size;
  if(required>0&&qualified>=required) crewReady++;
 }
 return {definitionId:definition.id,operational:operational.length,crewReady,combatReady:crewReady,uncrewed:operational.length-crewReady};
}

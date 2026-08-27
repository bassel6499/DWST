import type { EquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { PersonnelRegistry } from './personnelRegistry';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';

export interface EquipmentReadinessSummary { definitionId:string; operational:number; crewReady:number; combatReady:number; uncrewed:number; }

export function projectEquipmentPoolReadiness(definition:EquipmentDefinition,instances:EquipmentInstance[],assignments:InstanceCrewAssignment[],registry:PersonnelRegistry,requiredCrew:number):EquipmentReadinessSummary {
 if(!Number.isInteger(requiredCrew)||requiredCrew<=0) throw new Error('requiredCrew must be a positive integer');
 const relevant=instances.filter(i=>i.definitionId===definition.id);
 const operational=relevant.filter(i=>i.status==='operational');
 const personnelById=new Map(registry.personnel.map(p=>[p.id,p]));
 let crewReady=0;
 for(const instance of operational){
  const assigned=new Set(assignments.filter(a=>a.instanceId===instance.instanceId).map(a=>a.personnelId));
  const qualified=[...assigned].filter(id=>{const p=personnelById.get(id);return !!p&&p.status==='assigned'&&p.qualifications.includes('tankCrew');});
  if(qualified.length>=requiredCrew) crewReady++;
 }
 return {definitionId:definition.id,operational:operational.length,crewReady,combatReady:crewReady,uncrewed:operational.length-crewReady};
}

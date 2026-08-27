import type { EquipmentDefinition } from './equipmentCatalog';
import { resolveCrewRequirement } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';
import type { PersonnelRegistry } from './personnelRegistry';

export interface CanonicalUnitProjection {
  unitId:string;
  personnel:number;
  equipment:number;
  equipmentOperational:number;
  equipmentDamaged:number;
  equipmentDestroyed:number;
  equipmentMissing:number;
  crewRequired:number;
  crewReady:number;
  equipmentReady:number;
}

/**
 * Read-only aggregate projection for canonical state. Canonical records remain authoritative;
 * this function does not mutate them and deliberately does not project generic UnitState factors
 * such as morale, fatigue, logistics, or combat power.
 */
export function projectCanonicalUnit(
 unitId:string,
 registry:PersonnelRegistry,
 instances:EquipmentInstance[],
 assignments:InstanceCrewAssignment[],
 definitions:EquipmentDefinition[],
):CanonicalUnitProjection{
 const unitPersonnel=registry.personnel.filter(p=>p.unitId===unitId);
 const unitInstances=instances.filter(i=>i.unitId===unitId);
 const definitionMap=new Map(definitions.map(d=>[d.id,d]));
 const assignedByInstance=new Map<string,InstanceCrewAssignment[]>();
 for(const a of assignments){
  const instance=instances.find(i=>i.instanceId===a.instanceId);
  if(instance?.unitId===unitId){
   const list=assignedByInstance.get(a.instanceId)??[]; list.push(a); assignedByInstance.set(a.instanceId,list);
  }
 }
 let crewRequired=0; let crewReady=0; let equipmentReady=0;
 for(const instance of unitInstances){
  if(instance.status!=='operational') continue;
  const definition=definitionMap.get(instance.definitionId); if(!definition) continue;
  let requirement; try { requirement=resolveCrewRequirement(definition); } catch { continue; }
  crewRequired+=requirement.required;
  const assigned=assignedByInstance.get(instance.instanceId)??[];
  const ready=assigned.filter(a=>{const p=registry.personnel.find(x=>x.id===a.personnelId);return p?.status==='assigned'&&p.qualifications.includes(requirement.specialty);});
  crewReady+=Math.min(ready.length,requirement.required);
  if(ready.length>=requirement.required) equipmentReady++;
 }
 return {
  unitId,
  personnel:unitPersonnel.length,
  equipment:unitInstances.length,
  equipmentOperational:unitInstances.filter(i=>i.status==='operational').length,
  equipmentDamaged:unitInstances.filter(i=>i.status==='damaged').length,
  equipmentDestroyed:unitInstances.filter(i=>i.status==='destroyed').length,
  equipmentMissing:unitInstances.filter(i=>i.status==='missing').length,
  crewRequired,
  crewReady,
  equipmentReady,
 };
}

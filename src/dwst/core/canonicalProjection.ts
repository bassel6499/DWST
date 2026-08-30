import type { EquipmentDefinition } from './equipmentCatalog';
import { resolveCrewRequirement, validateEquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';
import type { PersonnelRegistry } from './personnelRegistry';
import type { CanonicalConsumableState } from './canonicalConsumables';

export interface CanonicalUnitProjection {
  unitId:string;
  personnel:number;
  equipment:number;
  ammunition:number;
  fuel:number;
  equipmentOperational:number;
  equipmentDamaged:number;
  equipmentDestroyed:number;
  equipmentMissing:number;
  crewRequired:number;
  crewReady:number;
  equipmentReady:number;
}

/** Read-only aggregate projection; canonical records remain authoritative. */
export function projectCanonicalUnit(unitId:string,registry:PersonnelRegistry,instances:EquipmentInstance[],assignments:InstanceCrewAssignment[],definitions:EquipmentDefinition[],consumables:CanonicalConsumableState[]):CanonicalUnitProjection{
 const unitPersonnel=registry.personnel.filter(p=>p.unitId===unitId);
 const unitInstances=instances.filter(i=>i.unitId===unitId);
 const consumable=consumables.find(c=>c.unitId===unitId);
 if(!consumable) throw new Error(`Missing canonical consumable coverage for unit ${unitId}`);
 const definitionMap=new Map(definitions.map(d=>[d.id,d]));
 const assignedByInstance=new Map<string,InstanceCrewAssignment[]>();
 for(const a of assignments){
  const instance=instances.find(i=>i.instanceId===a.instanceId);
  if(instance?.unitId===unitId){const list=assignedByInstance.get(a.instanceId)??[];list.push(a);assignedByInstance.set(a.instanceId,list);}
 }
 let crewRequired=0,crewReady=0,equipmentReady=0;
 for(const instance of unitInstances){
  if(instance.status!=='operational') continue;
  const definition=definitionMap.get(instance.definitionId);
  if(!definition) throw new Error(`Missing equipment definition ${instance.definitionId} for unit ${unitId}`);
  const validationErrors=validateEquipmentDefinition(definition);
  if(validationErrors.length) throw new Error(`Invalid equipment definition ${definition.id} for unit ${unitId}: ${validationErrors.join('; ')}`);
  const requirement=resolveCrewRequirement(definition);
  crewRequired+=requirement.requiredQualifiedCrew;
  const assigned=assignedByInstance.get(instance.instanceId)??[];
  const ready=assigned.filter(a=>{const p=registry.personnel.find(x=>x.id===a.personnelId);return p?.status==='assigned'&&p.qualifications.includes(requirement.specialty);});
  crewReady+=Math.min(ready.length,requirement.requiredQualifiedCrew);
  if(ready.length>=requirement.requiredQualifiedCrew) equipmentReady++;
 }
 return {unitId,personnel:unitPersonnel.length,equipment:unitInstances.length,ammunition:consumable.ammunition,fuel:consumable.fuel,equipmentOperational:unitInstances.filter(i=>i.status==='operational').length,equipmentDamaged:unitInstances.filter(i=>i.status==='damaged').length,equipmentDestroyed:unitInstances.filter(i=>i.status==='destroyed').length,equipmentMissing:unitInstances.filter(i=>i.status==='missing').length,crewRequired,crewReady,equipmentReady};
}

import type { PersonnelRegistry } from './personnelRegistry';
import type { EquipmentDefinition } from './equipmentCatalog';
import { resolveCrewRequirement } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';

export interface InstanceCrewAssignment { instanceId:string; slot:number; personnelId:string; specialty:string; }

export function validateInstanceCrewAssignments(assignments:InstanceCrewAssignment[], registry:PersonnelRegistry, instances:EquipmentInstance[], definitions:EquipmentDefinition[]):string[]{
 const errors:string[]=[]; const usedPersonnel=new Set<string>(); const usedSlots=new Set<string>();
 const instanceMap=new Map(instances.map(i=>[i.instanceId,i])); const definitionMap=new Map(definitions.map(d=>[d.id,d]));
 for(const a of assignments){
  const p=registry.personnel.find(x=>x.id===a.personnelId); const instance=instanceMap.get(a.instanceId);
  if(!p){errors.push(`Unknown personnel ID: ${a.personnelId}`);continue;}
  if(!instance){errors.push(`Unknown equipment instance ID: ${a.instanceId}`);continue;}
  const definition=definitionMap.get(instance.definitionId);
  if(!definition){errors.push(`Equipment instance references unknown definition: ${a.instanceId}`);continue;}
  if(instance.status!=='operational') errors.push(`Non-operational equipment cannot receive active crew: ${a.instanceId}`);
  if(!Number.isInteger(a.slot)||a.slot<1) errors.push(`Invalid crew slot: ${a.instanceId}/${a.slot}`);
  const slotKey=`${a.instanceId}:${a.slot}`;
  if(usedSlots.has(slotKey)) errors.push(`Crew slot occupied twice: ${slotKey}`);
  usedSlots.add(slotKey);
  if(usedPersonnel.has(a.personnelId)) errors.push(`Personnel assigned to multiple equipment instances: ${a.personnelId}`);
  usedPersonnel.add(a.personnelId);
  if(p.status!=='assigned') errors.push(`Personnel must be assigned before crewing equipment: ${a.personnelId}`);
  if(!p.qualifications.includes(a.specialty)) errors.push(`Personnel lacks qualification ${a.specialty}: ${a.personnelId}`);
  let requirement;
  try { requirement=resolveCrewRequirement(definition); }
  catch { errors.push(`Missing crew requirement for equipment definition: ${definition.id}`); continue; }
  if(a.specialty!==requirement.specialty) errors.push(`Crew specialty does not match equipment requirement: ${a.instanceId}`);
 }
 return errors;
}

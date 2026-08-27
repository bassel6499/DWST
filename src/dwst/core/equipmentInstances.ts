import type { EquipmentDefinition } from './equipmentCatalog';

export interface EquipmentInstance {
  instanceId:string;
  definitionId:string;
  /** Canonical ownership boundary: the unit that owns this physical system. */
  unitId?:string;
  serial?:string;
  status:'operational'|'damaged'|'destroyed'|'missing';
}

export function validateEquipmentInstances(instances:EquipmentInstance[],definitions:EquipmentDefinition[]):string[]{
 const errors:string[]=[]; const ids=new Set<string>(); const defs=new Set(definitions.map(d=>d.id));
 for(const i of instances){
  if(!i.instanceId) errors.push('Equipment instance requires instanceId');
  if(ids.has(i.instanceId)) errors.push(`Duplicate equipment instance ID: ${i.instanceId}`); ids.add(i.instanceId);
  if(!defs.has(i.definitionId)) errors.push(`Unknown equipment definition: ${i.definitionId}`);
  if(i.unitId!==undefined&&!i.unitId) errors.push(`Equipment instance unitId cannot be empty: ${i.instanceId}`);
  if(!['operational','damaged','destroyed','missing'].includes(i.status)) errors.push(`Invalid equipment status: ${i.instanceId}`);
 }
 return errors;
}

export function activeEquipmentInstanceIds(instances:EquipmentInstance[],definitionId:string):string[]{
 return instances.filter(i=>i.definitionId===definitionId&&i.status==='operational').map(i=>i.instanceId);
}

export type PersonnelRole='general'|'crew';
export interface PersonnelRecord { id:string; role:PersonnelRole; available:boolean; training:boolean; wounded:boolean; missing:boolean; killed:boolean; }
export interface PersonnelAssignment { personnelId:string; specialty:string; qualified:boolean; experience:'trained'|'experienced'|'veteran'; }

export function validatePersonnelIdentity(records:PersonnelRecord[], assignments:PersonnelAssignment[], total:number):string[]{
 const errors:string[]=[]; const ids=new Set<string>();
 for(const p of records){
  if(ids.has(p.id)) errors.push(`Duplicate personnel ID: ${p.id}`); ids.add(p.id);
  const active=[p.available,p.training,p.wounded,p.missing,p.killed].filter(Boolean).length;
  if(active!==1) errors.push(`Personnel ${p.id} must have exactly one status`);
 }
 if(records.length!==total) errors.push(`Personnel record count ${records.length} does not equal total ${total}`);
 const assigned=new Set<string>();
 for(const a of assignments){
  if(!ids.has(a.personnelId)) errors.push(`Assignment references unknown personnel: ${a.personnelId}`);
  if(assigned.has(a.personnelId)) errors.push(`Personnel assigned to multiple specialist crews: ${a.personnelId}`); assigned.add(a.personnelId);
 }
 return errors;
}

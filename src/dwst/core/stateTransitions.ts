import type { CanonicalResourceLedger, EquipmentLedger, SpecialistPool, PersonnelStatus } from './canonicalLedger';
import type { PersonnelRegistry } from './personnelRegistry';
import type { CrewAssignment } from './crewAssignments';

export type ResourceOperation =
  | { kind:'assignPersonnel'; personnelId:string; equipmentId:string; slot:number; specialty:SpecialistPool['specialty'] }
  | { kind:'unassignPersonnel'; personnelId:string }
  | { kind:'killPersonnel'; personnelId:string }
  | { kind:'completeTraining'; personnelId:string; specialty:SpecialistPool['specialty'] }
  | { kind:'damageEquipment'; equipmentId:string; amount:number }
  | { kind:'repairEquipment'; equipmentId:string; amount:number };

export interface TransitionResult { ledger:CanonicalResourceLedger; errors:string[]; registry?:PersonnelRegistry; assignments?:CrewAssignment[]; }
function clone<T>(x:T):T { return structuredClone(x); }
function findEquipment(l:CanonicalResourceLedger,id:string):EquipmentLedger|undefined { return l.equipment.find(e=>e.designation===id||e.type===id); }
function setStatusCount(p:CanonicalResourceLedger['personnel'],from:PersonnelStatus,to:PersonnelStatus){ if(p[from]<=0) throw new Error(`Personnel status underflow: ${from}`); p[from]--;p[to]++; }
function removeAssignment(assignments:CrewAssignment[],personnelId:string){ const i=assignments.findIndex(a=>a.personnelId===personnelId); if(i>=0) assignments.splice(i,1); }
function requirementFor(l:CanonicalResourceLedger,equipmentId:string){ return l.links.find(x=>x.equipmentId===equipmentId); }

/** Applies transitions transactionally. With a PersonnelRegistry, it is the authority for individual status/qualification; assignments are identity-level state and the ledger remains aggregate. */
export function applyResourceOperations(input:CanonicalResourceLedger,operations:ResourceOperation[],registryInput?:PersonnelRegistry,assignmentsInput:CrewAssignment[]=[]):TransitionResult {
 const next=clone(input); const registry=registryInput?clone(registryInput):undefined; const assignments=clone(assignmentsInput); const errors:string[]=[];
 const records=registry ? new Map(registry.personnel.map(p=>[p.id,p])) : undefined;
 for(const op of operations){
  if(op.kind==='assignPersonnel'){
   if(!registry||!records){errors.push(`Personnel registry is required for identity-aware assignment: ${op.personnelId}`);continue;}
   const person=records.get(op.personnelId); const link=requirementFor(next,op.equipmentId);
   if(!person){errors.push(`Unknown personnel ID: ${op.personnelId}`);continue;} if(!link){errors.push(`Unknown equipment crew requirement: ${op.equipmentId}`);continue;}
   if(person.status!=='available'){errors.push(`Personnel is not available for assignment: ${op.personnelId}`);continue;}
   if(!person.qualifications.includes(link.crewSpecialty)){errors.push(`Personnel lacks required qualification ${link.crewSpecialty}: ${op.personnelId}`);continue;}
   if(op.specialty!==link.crewSpecialty){errors.push(`Crew specialty does not match equipment requirement for ${op.equipmentId}`);continue;}
   if(!Number.isInteger(op.slot)||op.slot<1||op.slot>link.requiredQualifiedCrew){errors.push(`Invalid crew slot for ${op.equipmentId}: ${op.slot}`);continue;}
   if(assignments.some(a=>a.personnelId===op.personnelId)){errors.push(`Personnel assigned to multiple equipment slots: ${op.personnelId}`);continue;}
   if(assignments.some(a=>a.equipmentId===op.equipmentId&&a.slot===op.slot)){errors.push(`Crew slot already occupied: ${op.equipmentId}:${op.slot}`);continue;}
   person.status='assigned'; setStatusCount(next.personnel,'available','assigned'); assignments.push({equipmentId:op.equipmentId,slot:op.slot,personnelId:op.personnelId,specialty:link.crewSpecialty});
  } else if(op.kind==='unassignPersonnel') {
   if(!registry||!records){errors.push(`Personnel registry is required for identity-aware unassignment: ${op.personnelId}`);continue;}
   const person=records.get(op.personnelId); if(!person){errors.push(`Unknown personnel ID: ${op.personnelId}`);continue;}
   const i=assignments.findIndex(a=>a.personnelId===op.personnelId); if(i<0){errors.push(`Personnel has no assignment: ${op.personnelId}`);continue;}
   if(person.status!=='assigned'){errors.push(`Assigned personnel has invalid status: ${op.personnelId}`);continue;}
   person.status='available'; setStatusCount(next.personnel,'assigned','available'); assignments.splice(i,1);
  } else if(op.kind==='killPersonnel'){
   if(registry && records){
    const person=records.get(op.personnelId); if(!person || ['killed','missing','wounded'].includes(person.status)){errors.push(`Unknown or non-live personnel ID: ${op.personnelId}`);continue;}
    const from=person.status; person.status='killed'; setStatusCount(next.personnel,from,'killed'); removeAssignment(assignments,op.personnelId);
    for(const s of next.specialists){const ids=s.personnelIds??[];const i=ids.indexOf(op.personnelId);if(i>=0){ids.splice(i,1);s.personnel=Math.max(0,s.personnel-1);s.casualties++;if(s.qualified>0)s.qualified--;if(s.veteran>0)s.veteran--;else if(s.experienced>0)s.experienced--;else if(s.trained>0)s.trained--;s.personnelIds=ids;}}
   } else {
    const holder=next.specialists.find(s=>(s.personnelIds??[]).includes(op.personnelId)); if(!holder){errors.push(`Unknown personnel ID: ${op.personnelId}`);continue;}
    setStatusCount(next.personnel,'assigned','killed');
    for(const s of next.specialists){const ids=s.personnelIds??[];const i=ids.indexOf(op.personnelId);if(i>=0){ids.splice(i,1);s.personnel=Math.max(0,s.personnel-1);s.casualties++;if(s.qualified>0)s.qualified--;if(s.veteran>0)s.veteran--;else if(s.experienced>0)s.experienced--;else if(s.trained>0)s.trained--;s.personnelIds=ids;}}
   }
  } else if(op.kind==='completeTraining') {
   const s=next.specialists.find(x=>x.specialty===op.specialty);if(!s){errors.push(`Unknown specialty ${op.specialty}`);continue;}
   if(registry && records){const person=records.get(op.personnelId);if(!person){errors.push(`Unknown personnel ID: ${op.personnelId}`);continue;}if(person.status!=='training'){errors.push(`Personnel is not currently training: ${op.personnelId}`);continue;}if(!person.qualifications.includes(op.specialty)){errors.push(`Personnel lacks qualification for ${op.specialty}: ${op.personnelId}`);continue;}if(s.training<=0){errors.push(`No training slot/personnel available for ${op.personnelId}`);continue;}person.status='available';s.training--;s.qualified++;s.trained++;if(s.personnelIds&&!s.personnelIds.includes(op.personnelId))s.personnelIds.push(op.personnelId);setStatusCount(next.personnel,'training','available');}
   else {if(!(s.personnelIds??[]).includes(op.personnelId)){errors.push(`Personnel is not in specialty pool: ${op.personnelId}`);continue;}if(s.training<=0){errors.push(`No training slot/personnel available for ${op.personnelId}`);continue;}s.training--;s.qualified++;s.trained++;}
  } else {
   const e=findEquipment(next,op.equipmentId);if(!e)errors.push(`Unknown equipment ${op.equipmentId}`);else if(!Number.isInteger(op.amount)||op.amount<=0)errors.push('Equipment operation amount must be positive');else if(op.kind==='damageEquipment'){const n=Math.min(e.operational,op.amount);e.operational-=n;e.damaged+=n;}else{const n=Math.min(e.damaged,op.amount);e.damaged-=n;e.operational+=n;}
  }
 }
 if(errors.length)return {ledger:input,errors,registry:registryInput,assignments:assignmentsInput};
 return {ledger:next,errors:[],registry,assignments};
}

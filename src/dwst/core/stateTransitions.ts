import type { CanonicalResourceLedger, EquipmentLedger, SpecialistPool, PersonnelStatus } from './canonicalLedger';
import type { PersonnelRegistry } from './personnelRegistry';

export type ResourceOperation =
  | { kind:'killPersonnel'; personnelId:string }
  | { kind:'completeTraining'; personnelId:string; specialty:SpecialistPool['specialty'] }
  | { kind:'damageEquipment'; equipmentId:string; amount:number }
  | { kind:'repairEquipment'; equipmentId:string; amount:number };

export interface TransitionResult { ledger:CanonicalResourceLedger; errors:string[]; registry?:PersonnelRegistry; }
function clone<T>(x:T):T { return structuredClone(x); }
function findEquipment(l:CanonicalResourceLedger,id:string):EquipmentLedger|undefined { return l.equipment.find(e=>e.designation===id||e.type===id); }
function setStatusCount(p:CanonicalResourceLedger['personnel'],from:PersonnelStatus,to:PersonnelStatus){
 if(p[from]<=0) throw new Error(`Personnel status underflow: ${from}`);
 p[from]--;p[to]++;
}

/** Applies transitions transactionally. If a PersonnelRegistry is supplied, it is the authority for individual status/qualification; the ledger is the aggregate projection. */
export function applyResourceOperations(input:CanonicalResourceLedger,operations:ResourceOperation[],registryInput?:PersonnelRegistry):TransitionResult {
 const next=clone(input); const registry=registryInput?clone(registryInput):undefined; const errors:string[]=[];
 const records=registry ? new Map(registry.personnel.map(p=>[p.id,p])) : undefined;
 for(const op of operations){
  if(op.kind==='killPersonnel'){
   if(registry && records){
    const person=records.get(op.personnelId);
    if(!person || ['killed','missing','wounded'].includes(person.status)){errors.push(`Unknown or non-live personnel ID: ${op.personnelId}`);continue;}
    const from=person.status; person.status='killed'; setStatusCount(next.personnel,from,'killed');
    for(const s of next.specialists){const ids=s.personnelIds??[];const i=ids.indexOf(op.personnelId);if(i>=0){ids.splice(i,1);s.personnel=Math.max(0,s.personnel-1);s.casualties++;if(s.qualified>0)s.qualified--;if(s.veteran>0)s.veteran--;else if(s.experienced>0)s.experienced--;else if(s.trained>0)s.trained--;s.personnelIds=ids;}}
   } else {
    const holder=next.specialists.find(s=>(s.personnelIds??[]).includes(op.personnelId));
    if(!holder){errors.push(`Unknown personnel ID: ${op.personnelId}`);continue;}
    setStatusCount(next.personnel,'assigned','killed');
    for(const s of next.specialists){const ids=s.personnelIds??[];const i=ids.indexOf(op.personnelId);if(i>=0){ids.splice(i,1);s.personnel=Math.max(0,s.personnel-1);s.casualties++;if(s.qualified>0)s.qualified--;if(s.veteran>0)s.veteran--;else if(s.experienced>0)s.experienced--;else if(s.trained>0)s.trained--;s.personnelIds=ids;}}
   }
  } else if(op.kind==='completeTraining') {
   const s=next.specialists.find(x=>x.specialty===op.specialty);if(!s){errors.push(`Unknown specialty ${op.specialty}`);continue;}
   if(registry && records){
    const person=records.get(op.personnelId);if(!person){errors.push(`Unknown personnel ID: ${op.personnelId}`);continue;}
    if(person.status!=='training'){errors.push(`Personnel is not currently training: ${op.personnelId}`);continue;}
    if(!person.qualifications.includes(op.specialty)){errors.push(`Personnel lacks qualification for ${op.specialty}: ${op.personnelId}`);continue;}
    if(s.training<=0){errors.push(`No training slot/personnel available for ${op.personnelId}`);continue;}
    person.status='available';s.training--;s.qualified++;s.trained++;if(s.personnelIds&&!s.personnelIds.includes(op.personnelId))s.personnelIds.push(op.personnelId);
    setStatusCount(next.personnel,'training','available');
   } else {
    if(!(s.personnelIds??[]).includes(op.personnelId)){errors.push(`Personnel is not in specialty pool: ${op.personnelId}`);continue;}
    if(s.training<=0){errors.push(`No training slot/personnel available for ${op.personnelId}`);continue;}
    s.training--;s.qualified++;s.trained++;
   }
  } else {
   const e=findEquipment(next,op.equipmentId);if(!e)errors.push(`Unknown equipment ${op.equipmentId}`);else if(!Number.isInteger(op.amount)||op.amount<=0)errors.push('Equipment operation amount must be positive');else if(op.kind==='damageEquipment'){const n=Math.min(e.operational,op.amount);e.operational-=n;e.damaged+=n;}else{const n=Math.min(e.damaged,op.amount);e.damaged-=n;e.operational+=n;}
  }
 }
 if(errors.length)return {ledger:input,errors,registry:registryInput};
 return {ledger:next,errors:[],registry};
}

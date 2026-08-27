import type { CanonicalResourceLedger, EquipmentLedger, SpecialistPool } from './canonicalLedger';

export type ResourceOperation =
  | { kind:'killPersonnel'; personnelId:string }
  | { kind:'completeTraining'; personnelId:string; specialty:SpecialistPool['specialty'] }
  | { kind:'damageEquipment'; equipmentId:string; amount:number }
  | { kind:'repairEquipment'; equipmentId:string; amount:number };

export interface TransitionResult { ledger:CanonicalResourceLedger; errors:string[]; }
function clone<T>(x:T):T { return structuredClone(x); }
function findEquipment(l:CanonicalResourceLedger,id:string):EquipmentLedger|undefined { return l.equipment.find(e=>e.designation===id||e.type===id); }

export function applyResourceOperations(input:CanonicalResourceLedger,operations:ResourceOperation[]):TransitionResult {
 const next=clone(input); const errors:string[]=[];
 for(const op of operations){
  if(op.kind==='killPersonnel'){
   let found=false;
   if(next.personnel.available>0){next.personnel.available--;next.personnel.killed++;found=true;}
   else if(next.personnel.assigned>0){next.personnel.assigned--;next.personnel.killed++;found=true;}
   else if(next.personnel.training>0){next.personnel.training--;next.personnel.killed++;found=true;}
   if(!found) errors.push(`No live personnel available for casualty ${op.personnelId}`);
   for(const s of next.specialists){const ids=s.personnelIds ?? [];const i=ids.indexOf(op.personnelId);if(i>=0){ids.splice(i,1);s.personnel--;s.casualties++;if(s.qualified>0)s.qualified--;if(s.veteran>0)s.veteran--;else if(s.experienced>0)s.experienced--;else if(s.trained>0)s.trained--;s.personnelIds=ids;}}
  } else if(op.kind==='completeTraining'){
   const s=next.specialists.find(x=>x.specialty===op.specialty);if(!s)errors.push(`Unknown specialty ${op.specialty}`);else{s.training=Math.max(0,s.training-1);s.qualified++;s.trained++;}
  } else {
   const e=findEquipment(next,op.equipmentId);if(!e)errors.push(`Unknown equipment ${op.equipmentId}`);else if(!Number.isInteger(op.amount)||op.amount<=0)errors.push('Equipment operation amount must be positive');else if(op.kind==='damageEquipment'){const n=Math.min(e.operational,op.amount);e.operational-=n;e.damaged+=n;}else{const n=Math.min(e.damaged,op.amount);e.damaged-=n;e.operational+=n;}
  }
 }
 if(errors.length)return {ledger:input,errors};
 return {ledger:next,errors:[]};
}

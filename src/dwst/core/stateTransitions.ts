import type { CanonicalResourceLedger, EquipmentLedger, SpecialistPool, PersonnelStatus } from './canonicalLedger';

export type ResourceOperation =
  | { kind:'killPersonnel'; personnelId:string }
  | { kind:'completeTraining'; personnelId:string; specialty:SpecialistPool['specialty'] }
  | { kind:'damageEquipment'; equipmentId:string; amount:number }
  | { kind:'repairEquipment'; equipmentId:string; amount:number };

export interface TransitionResult { ledger:CanonicalResourceLedger; errors:string[]; }
function clone<T>(x:T):T { return structuredClone(x); }
function findEquipment(l:CanonicalResourceLedger,id:string):EquipmentLedger|undefined { return l.equipment.find(e=>e.designation===id||e.type===id); }
function findPersonStatus(l:CanonicalResourceLedger,id:string):PersonnelStatus|undefined {
 for(const s of l.specialists){ if((s.personnelIds??[]).includes(id)) return s.training>0 && !s.qualified ? 'training' : 'assigned'; }
 return undefined;
}
function setStatusCount(p:CanonicalResourceLedger['personnel'],from:PersonnelStatus,to:PersonnelStatus){ p[from]--;p[to]++; }

export function applyResourceOperations(input:CanonicalResourceLedger,operations:ResourceOperation[]):TransitionResult {
 const next=clone(input); const errors:string[]=[];
 for(const op of operations){
  if(op.kind==='killPersonnel'){
   const status=findPersonStatus(next,op.personnelId);
   if(!status || status==='killed' || status==='missing' || status==='wounded') { errors.push(`Unknown or non-live personnel ID: ${op.personnelId}`); continue; }
   setStatusCount(next.personnel,status,'killed');
   for(const s of next.specialists){ const ids=s.personnelIds??[]; const i=ids.indexOf(op.personnelId); if(i>=0){ ids.splice(i,1); s.personnel--; s.casualties++; if(s.qualified>0)s.qualified--; if(s.veteran>0)s.veteran--; else if(s.experienced>0)s.experienced--; else if(s.trained>0)s.trained--; s.personnelIds=ids; } }
  } else if(op.kind==='completeTraining') {
   const s=next.specialists.find(x=>x.specialty===op.specialty); if(!s) {errors.push(`Unknown specialty ${op.specialty}`);continue;}
   if(!(s.personnelIds??[]).includes(op.personnelId)) {errors.push(`Personnel is not in specialty pool: ${op.personnelId}`);continue;}
   if(s.training<=0) {errors.push(`No training slot/personnel available for ${op.personnelId}`);continue;}
   s.training--; s.qualified++; s.trained++;
  } else {
   const e=findEquipment(next,op.equipmentId); if(!e)errors.push(`Unknown equipment ${op.equipmentId}`); else if(!Number.isInteger(op.amount)||op.amount<=0)errors.push('Equipment operation amount must be positive'); else if(op.kind==='damageEquipment'){const n=Math.min(e.operational,op.amount);e.operational-=n;e.damaged+=n;}else{const n=Math.min(e.damaged,op.amount);e.damaged-=n;e.operational+=n;}
  }
 }
 if(errors.length)return {ledger:input,errors};
 return {ledger:next,errors:[]};
}

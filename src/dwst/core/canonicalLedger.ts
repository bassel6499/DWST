import type { EquipmentType } from './equipment';
import type { CrewSpecialty } from './crews';

export type PersonnelStatus='available'|'training'|'assigned'|'wounded'|'killed'|'missing';
export type CrewExperience='trained'|'experienced'|'veteran';
export interface PersonnelLedger { total:number; available:number; assigned:number; training:number; wounded:number; missing:number; killed:number; }
/** Specialist manpower is a subset of total personnel. qualified + training = personnel; experience levels partition qualified. */
export interface SpecialistPool { specialty:CrewSpecialty; personnel:number; qualified:number; training:number; casualties:number; veteran:number; experienced:number; trained:number; }
export interface EquipmentLedger { type:EquipmentType; designation:string; total:number; operational:number; damaged:number; destroyed:number; assigned:number; }
/** requiredQualifiedCrew is authoritative. personnelPerSystem is optional legacy/audit metadata and must agree when present. */
export interface EquipmentCrewLink { equipmentId:string; crewSpecialty:CrewSpecialty; requiredQualifiedCrew:number; personnelPerSystem?:number; }
export interface CanonicalResourceLedger { personnel:PersonnelLedger; specialists:SpecialistPool[]; equipment:EquipmentLedger[]; links:EquipmentCrewLink[]; }
export function validateLedger(l:CanonicalResourceLedger):string[]{
 const e:string[]=[]; const p=l.personnel; const pv=[p.total,p.available,p.assigned,p.training,p.wounded,p.missing,p.killed];
 if(pv.some(v=>!Number.isInteger(v)||v<0))e.push('Personnel counts must be non-negative integers');
 if(p.available+p.assigned+p.training+p.wounded+p.missing+p.killed!==p.total)e.push('Personnel ledger does not balance');
 for(const s of l.specialists){
  const sv=[s.personnel,s.qualified,s.training,s.casualties,s.veteran,s.experienced,s.trained];
  if(sv.some(v=>!Number.isInteger(v)||v<0))e.push(`Invalid specialist counts for ${s.specialty}`);
  if(s.personnel!==s.qualified+s.training)e.push(`Specialist pool ${s.specialty} does not balance`);
  if(s.veteran+s.experienced+s.trained!==s.qualified)e.push(`Specialist experience does not partition qualified pool for ${s.specialty}`);
  if(s.casualties>s.personnel)e.push(`Specialist casualties exceed specialty personnel for ${s.specialty}`);
 }
 for(const x of l.equipment){
  const xv=[x.total,x.operational,x.damaged,x.destroyed,x.assigned];
  if(xv.some(v=>!Number.isInteger(v)||v<0))e.push(`Invalid equipment counts for ${x.designation}`);
  if(x.total!==x.operational+x.damaged+x.destroyed)e.push(`Equipment ledger does not balance for ${x.designation}`);
  if(x.assigned>x.operational)e.push(`Assigned equipment exceeds operational equipment for ${x.designation}`);
 }
 for(const link of l.links){
  if(!Number.isInteger(link.requiredQualifiedCrew)||link.requiredQualifiedCrew<=0)e.push(`Invalid crew requirement for ${link.equipmentId}`);
  if(link.personnelPerSystem!==undefined&&link.personnelPerSystem!==link.requiredQualifiedCrew)e.push(`Crew requirement mismatch for ${link.equipmentId}`);
 }
 return e;
}
export function usableSystems(e:EquipmentLedger,link:EquipmentCrewLink,specialists:SpecialistPool[]):number{ const crew=specialists.find(s=>s.specialty===link.crewSpecialty); if(!crew||link.requiredQualifiedCrew<=0)return 0; return Math.min(e.operational,Math.floor(crew.qualified/link.requiredQualifiedCrew)); }

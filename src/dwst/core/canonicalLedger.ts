import type { EquipmentType } from './equipment';
import type { CrewSpecialty } from './crews';

export type PersonnelStatus='available'|'training'|'assigned'|'wounded'|'killed'|'missing';

export interface PersonnelLedger {
  total:number;
  available:number;
  assigned:number;
  training:number;
  wounded:number;
  missing:number;
  killed:number;
}

export interface SpecialistPool {
  specialty:CrewSpecialty;
  personnel:number;
  qualified:number;
  training:number;
  casualties:number;
  veteran:number;
  experienced:number;
  trained:number;
}

export interface EquipmentLedger {
  type:EquipmentType;
  designation:string;
  total:number;
  operational:number;
  damaged:number;
  destroyed:number;
  assigned:number;
}

export interface EquipmentCrewLink {
  equipmentId:string;
  crewSpecialty:CrewSpecialty;
  personnelPerSystem:number;
  requiredQualifiedCrew:number;
}

export interface CanonicalResourceLedger {
  personnel:PersonnelLedger;
  specialists:SpecialistPool[];
  equipment:EquipmentLedger[];
  links:EquipmentCrewLink[];
}

export function validateLedger(l:CanonicalResourceLedger):string[]{
  const e:string[]=[];
  const p=l.personnel;
  const pSum=p.available+p.assigned+p.training+p.wounded+p.missing+p.killed;
  if([p.total,...Object.values(p).filter(v=>typeof v==='number')].some(v=>!Number.isInteger(v)||v<0)) e.push('Personnel counts must be non-negative integers');
  if(pSum!==p.total)e.push('Personnel ledger does not balance');
  for(const s of l.specialists){
    if(s.personnel!==s.qualified+s.training)e.push(`Specialist pool ${s.specialty} does not balance`);
    if(s.veteran+s.experienced+s.trained>s.qualified)e.push(`Specialist experience exceeds qualified pool for ${s.specialty}`);
  }
  for(const x of l.equipment){
    if(x.total!==x.operational+x.damaged+x.destroyed)e.push(`Equipment ledger does not balance for ${x.designation}`);
    if(x.assigned>x.operational)e.push(`Assigned equipment exceeds operational equipment for ${x.designation}`);
  }
  return e;
}

export function usableSystems(e:EquipmentLedger,link:EquipmentCrewLink,specialists:SpecialistPool[]):number{
  const crew=specialists.find(s=>s.specialty===link.crewSpecialty);
  if(!crew)return 0;
  return Math.min(e.operational,Math.floor(crew.qualified/link.requiredQualifiedCrew));
}

import type { UnitState } from './types';
import type { EquipmentPool } from './equipment';
import type { CrewPool } from './crews';
import type { CanonicalResourceLedger, EquipmentCrewLink, EquipmentLedger, PersonnelLedger, SpecialistPool } from './canonicalLedger';

export interface LegacyResourceSnapshot { unit:UnitState; equipment:EquipmentPool[]; crews:CrewPool[]; }
export interface MigrationResult { ok:boolean; ledger?:CanonicalResourceLedger; errors:string[]; warnings:string[]; }

function personnelLedger(u:UnitState):PersonnelLedger {
  return {total:u.personnel,available:u.personnel,assigned:0,training:0,wounded:0,missing:0,killed:0};
}

export function migrateLegacyResources(s:LegacyResourceSnapshot):MigrationResult {
  const errors:string[]=[]; const warnings:string[]=[];
  if(!Number.isInteger(s.unit.personnel)||s.unit.personnel<0) errors.push('Legacy personnel total is invalid');
  const specialists:SpecialistPool[]=s.crews.map(c=>({specialty:c.specialty,personnel:c.ready+c.training,qualified:c.ready,training:c.training,casualties:c.casualties,veteran:0,experienced:0,trained:c.ready}));
  const equipment:EquipmentLedger[]=s.equipment.map(e=>({type:e.type,designation:e.type,total:e.initial,operational:e.operational,damaged:e.damaged,destroyed:e.destroyed,assigned:0}));
  const links:EquipmentCrewLink[]=s.equipment.map(e=>({equipmentId:e.type,crewSpecialty:requireCrew(e.type),requiredQualifiedCrew:crewRequirement(e.type)}));
  const ledger:CanonicalResourceLedger={personnel:personnelLedger(s.unit),specialists,equipment,links};
  if(s.equipment.some(e=>e.initial!==e.operational+e.damaged+e.destroyed)) errors.push('Legacy equipment state is not conserved');
  if(s.crews.some(c=>c.ready<0||c.training<0||c.casualties<0)) errors.push('Legacy crew pool contains invalid values');
  if(s.crews.some(c=>c.casualties>c.ready+c.training)) warnings.push('Legacy crew casualties exceed current crew pool; provenance must be reviewed');
  for(const e of s.equipment){const req=crewRequirement(e.type);const c=s.crews.find(x=>x.specialty===requireCrew(e.type));if(e.operational>0&&!c) warnings.push(`No legacy crew pool found for ${e.type}; usable systems will be zero until crew data is supplied`);else if(c&&Math.floor(c.ready/req)<e.operational) warnings.push(`Legacy crew shortage limits usable ${e.type} systems`);}
  return {ok:errors.length===0,ledger:errors.length===0?ledger:undefined,errors,warnings};
}
function requireCrew(type:EquipmentPool['type']):CrewPool['specialty'] { const m:any={tank:'tankCrew',tankDestroyer:'tankDestroyerCrew',atGun:'atGunCrew',artillery:'artilleryCrew',spg:'spgCrew',aa:'aaCrew',aircraft:'airCrew',truck:'driver'}; return m[type]; }
function crewRequirement(type:EquipmentPool['type']):number { const m:any={tank:5,tankDestroyer:5,atGun:6,artillery:8,spg:6,aa:6,aircraft:2,truck:2}; return m[type]; }

import type { UnitState } from './types';
import type { EquipmentPool, EquipmentType } from './equipment';

export type CrewSpecialty='tankCrew'|'tankDestroyerCrew'|'atGunCrew'|'artilleryCrew'|'spgCrew'|'aaCrew'|'airCrew'|'driver'|'infantry';
export interface CrewPool { specialty:CrewSpecialty; trained:number; ready:number; training:number; casualties:number; }

export const crewRequirement:Record<Exclude<CrewSpecialty,'infantry'>,number>={tankCrew:5,tankDestroyerCrew:5,atGunCrew:6,artilleryCrew:8,spgCrew:6,aaCrew:6,airCrew:2,driver:2};

export function crewTypeForEquipment(type:EquipmentType):CrewSpecialty{
 const map:Record<EquipmentType,CrewSpecialty>={tank:'tankCrew',tankDestroyer:'tankDestroyerCrew',atGun:'atGunCrew',artillery:'artilleryCrew',spg:'spgCrew',aa:'aaCrew',aircraft:'airCrew',truck:'driver'};
 return map[type];
}

export function usableEquipment(pool:EquipmentPool, crews:CrewPool[]):number{
 const specialty=crewTypeForEquipment(pool.type);
 if(specialty==='infantry') return 0;
 const c=crews.find(x=>x.specialty===specialty); if(!c) return 0;
 return Math.min(pool.operational,Math.floor(c.ready/crewRequirement[specialty]));
}

export interface TrainingOrder { from:'infantry'; to:CrewSpecialty; personnel:number; hours:number; }
export function trainCrews(unit:UnitState, crews:CrewPool[], order:TrainingOrder):number{
 const hoursNeeded=order.to==='airCrew'?240:order.to==='tankCrew'||order.to==='tankDestroyerCrew'?120:72;
 if(order.hours<hoursNeeded||order.personnel<=0||unit.personnel<order.personnel)return 0;
 const source=crews.find(c=>c.specialty==='infantry');
 if(source && source.trained<order.personnel)return 0;
 if(source)source.trained-=order.personnel;
 let target=crews.find(c=>c.specialty===order.to);
 if(!target){target={specialty:order.to,trained:0,ready:0,training:0,casualties:0};crews.push(target);}
 target.trained+=order.personnel; target.ready+=order.personnel;
 unit.readiness=Math.max(0,unit.readiness-0.03);
 unit.logistics=Math.max(0,unit.logistics-0.01);
 if(order.to==='infantry') return 0;
 return Math.floor(order.personnel/crewRequirement[order.to]);
}

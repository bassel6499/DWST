import type { EquipmentPool } from './equipment';
import type { CrewExperiencePool } from './crewExperience';
import { crewEffectiveness } from './crewExperience';
import { crewRequirement, crewTypeForEquipment } from './crews';

export interface CrewCombatContribution { type:EquipmentPool['type']; usable:number; crewSkill:number; effectiveness:number; }

export function crewCombatContributions(pools:EquipmentPool[], crews:CrewExperiencePool[]):CrewCombatContribution[] {
 return pools.map(p=>{
  const specialty=crewTypeForEquipment(p.type);
  if(specialty==='infantry') return {type:p.type,usable:0,crewSkill:0,effectiveness:0};
  const c=crews.find(x=>x.specialty===specialty);
  if(!c) return {type:p.type,usable:0,crewSkill:0,effectiveness:0};
  const usable=Math.min(p.operational,Math.floor(c.ready/crewRequirement[specialty]));
  const skill=crewEffectiveness(c);
  return {type:p.type,usable,crewSkill:c.averageSkill,effectiveness:skill*(usable/Math.max(1,p.initial))};
 });
}

export function equipmentCombatPower(pools:EquipmentPool[],crews:CrewExperiencePool[]):number {
 return crewCombatContributions(pools,crews).reduce((sum,x)=>sum+x.effectiveness,0);
}

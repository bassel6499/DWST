import type { CrewPool, CrewSpecialty } from './crews';

export interface CrewExperiencePool extends CrewPool {
  veteran:number;
  experienced:number;
  trained:number;
  averageSkill:number;
}

export function crewSkill(c:CrewExperiencePool):number {
  const total=Math.max(1,c.ready+c.training);
  return Math.max(0,Math.min(1,(c.veteran*1+c.experienced*.75+c.trained*.45)/total));
}

/** Allocate crew casualties without automatically restoring destroyed specialists. */
export function applyCrewCasualties(c:CrewExperiencePool, losses:number):void {
  let remaining=Math.max(0,Math.floor(losses));
  const pools=[['veteran',c.veteran],['experienced',c.experienced],['trained',c.trained]] as const;
  for(const [key,count] of pools){
    const hit=Math.min(count,remaining);
    c[key]-=hit;
    c.casualties+=hit;
    c.ready=Math.max(0,c.ready-hit);
    remaining-=hit;
    if(remaining===0) break;
  }
  c.averageSkill=crewSkill(c);
}

/** Newly converted infantry begins as trained crew; veteran/experienced status is never fabricated. */
export function graduateInfantry(c:CrewExperiencePool, personnel:number):number {
  const n=Math.max(0,Math.floor(personnel));
  c.trained+=n;
  c.ready+=n;
  c.averageSkill=crewSkill(c);
  return n;
}

export function progressCrewTraining(c:CrewExperiencePool,hours:number):number {
  if(c.training<=0||hours<=0)return 0;
  const graduated=Math.min(c.training,Math.floor(hours/24));
  c.training-=graduated;
  c.trained+=graduated;
  c.ready+=graduated;
  c.averageSkill=crewSkill(c);
  return graduated;
}

export function crewEffectiveness(c:CrewExperiencePool):number {
  return .55+.45*crewSkill(c);
}

export type { CrewSpecialty };

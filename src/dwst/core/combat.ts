import type { ScenarioState } from './types';
import { requireCombatRuleset } from './rulesets';
import { detectContacts } from './detection';
import { applyCombatResult } from './combatState';
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export interface Engagement { attackerId:string; defenderId:string; distanceKm:number; detectedByAttacker:boolean; result:string; }

/** Resolve engagements through the scenario-selected era ruleset. */
export function resolveEngagements(state:ScenarioState):Engagement[]{
 const ruleset=requireCombatRuleset(state.era);
 const contacts=detectContacts(state), engagements:Engagement[]=[], seen=new Set<string>();
 for(const c of contacts){if(!c.detected)continue;const a=state.units[c.observerId],b=state.units[c.targetId];if(!a||!b)continue;const attacker=a.order?.type==='attack'?a:null;if(!attacker||attacker.side===b.side||b.status==='destroyed')continue;const key=[attacker.id,b.id].sort().join(':');if(seen.has(key))continue;seen.add(key);
  const r=ruleset.resolveCombat({attacker,defender:b,state,surprise:clamp(attacker.intelligence-b.intelligence,-.5,.5)});
  const applied=applyCombatResult(attacker,b,r);
  Object.assign(attacker,applied.attacker); Object.assign(b,applied.defender);
  engagements.push({attackerId:attacker.id,defenderId:b.id,distanceKm:c.distanceKm,detectedByAttacker:true,result:`${attacker.name}: -${r.attackerLosses} personnel; ${b.name}: -${r.defenderLosses} personnel.`});
 }
 return engagements;
}

/** Backward-compatible WWII entry point. */
export function resolveWW2Engagements(state:ScenarioState):Engagement[]{
 return resolveEngagements({...state,era:'ww2'});
}

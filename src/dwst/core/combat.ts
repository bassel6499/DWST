import type { ScenarioState } from './types';
import { resolveWW2SquareLaw } from './ww2SquareLaw';
import { detectContacts } from './detection';
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export interface Engagement { attackerId:string; defenderId:string; distanceKm:number; detectedByAttacker:boolean; result:string; }
export function resolveWW2Engagements(state:ScenarioState):Engagement[]{
 const contacts=detectContacts(state), engagements:Engagement[]=[], seen=new Set<string>();
 for(const c of contacts){if(!c.detected)continue;const a=state.units[c.observerId],b=state.units[c.targetId];if(!a||!b)continue;const attacker=a.order?.type==='attack'?a:null;if(!attacker||attacker.side===b.side||b.status==='destroyed')continue;const key=[attacker.id,b.id].sort().join(':');if(seen.has(key))continue;seen.add(key);
  const r=resolveWW2SquareLaw({attacker,defender:b,terrainDefense:state.terrain,weather:state.weather,surprise:clamp(attacker.intelligence-b.intelligence,-.5,.5),artillerySupport:0});
  attacker.personnel=Math.max(0,attacker.personnel-r.attackerLosses);attacker.equipment=Math.max(0,attacker.equipment-r.attackerEquipmentLosses);b.personnel=Math.max(0,b.personnel-r.defenderLosses);b.equipment=Math.max(0,b.equipment-r.defenderEquipmentLosses);attacker.cumulativeLosses+=r.attackerLosses;b.cumulativeLosses+=r.defenderLosses;
  attacker.readiness=clamp(attacker.readiness-r.attackerLosses/Math.max(attacker.personnel+r.attackerLosses,1)*.35);b.readiness=clamp(b.readiness-r.defenderLosses/Math.max(b.personnel+r.defenderLosses,1)*.35);
  if(attacker.personnel<.15*10000)attacker.status='destroyed';if(b.personnel<.15*10000)b.status='destroyed';
  engagements.push({attackerId:attacker.id,defenderId:b.id,distanceKm:c.distanceKm,detectedByAttacker:true,result:`${attacker.name}: -${r.attackerLosses} personnel; ${b.name}: -${r.defenderLosses} personnel.`});
 }
 return engagements;
}

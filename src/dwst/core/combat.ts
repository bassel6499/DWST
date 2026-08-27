import type { ScenarioState, UnitState } from './types';
import { resolveWW2Combat } from './ww2';
import { detectContacts } from './detection';

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export interface Engagement { attackerId:string; defenderId:string; distanceKm:number; detectedByAttacker:boolean; result:string; }

/** Resolve only engagements supported by explicit orders and detected contacts.
 * This prevents units from magically fighting across the map. */
export function resolveWW2Engagements(state:ScenarioState):Engagement[]{
 const contacts=detectContacts(state); const engagements:Engagement[]=[]; const seen=new Set<string>();
 for(const c of contacts){
  if(!c.detected) continue;
  const a=state.units[c.observerId], b=state.units[c.targetId]; if(!a||!b) continue;
  const attacker=a.order?.type==='attack'?a:null;
  if(!attacker||attacker.side===b.side||b.status==='destroyed') continue;
  const key=[attacker.id,b.id].sort().join(':'); if(seen.has(key)) continue; seen.add(key);
  const result=resolveWW2Combat({attacker,defender:b,terrainDefense:state.terrain,weather:state.weather,surprise:clamp(attacker.intelligence-b.intelligence),artillerySupport:0});
  attacker.personnel=Math.max(0,attacker.personnel-result.attackerLosses);
  attacker.equipment=Math.max(0,attacker.equipment-result.attackerEquipmentLosses);
  b.personnel=Math.max(0,b.personnel-result.defenderLosses);
  b.equipment=Math.max(0,b.equipment-result.defenderEquipmentLosses);
  attacker.cumulativeLosses+=result.attackerLosses; b.cumulativeLosses+=result.defenderLosses;
  attacker.readiness=clamp(attacker.readiness-result.attackerLosses/Math.max(attacker.personnel+result.attackerLosses,1)*0.35);
  b.readiness=clamp(b.readiness-result.defenderLosses/Math.max(b.personnel+result.defenderLosses,1)*0.35);
  if(attacker.personnel<0.15*10000) attacker.status='destroyed';
  if(b.personnel<0.15*10000) b.status='destroyed';
  engagements.push({attackerId:attacker.id,defenderId:b.id,distanceKm:c.distanceKm,detectedByAttacker:true,result:`${attacker.name}: -${result.attackerLosses} personnel; ${b.name}: -${result.defenderLosses} personnel.`});
 }
 return engagements;
}

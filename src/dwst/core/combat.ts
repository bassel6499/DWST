import type { CombatContext } from './combatContext';
import type { ScenarioState } from './types';
import { getEraRuleset } from './eraRules';
import { detectContacts } from './detection';

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export interface Engagement {
  attackerId:string;
  defenderId:string;
  distanceKm:number;
  detectedByAttacker:boolean;
  attackerLosses:number;
  defenderLosses:number;
  attackerEquipmentLosses:number;
  defenderEquipmentLosses:number;
  attackerAmmunitionDelta:number;
  defenderAmmunitionDelta:number;
  attackerFuelDelta:number;
  defenderFuelDelta:number;
  attackerReadinessDelta:number;
  defenderReadinessDelta:number;
  attackerMoraleDelta:number;
  defenderMoraleDelta:number;
  result:string;
}

/** Resolve engagements through the single era-owned combat ruleset. */
export function resolveEngagements(state:ScenarioState,contextByUnit?:Readonly<Record<string,CombatContext>>):Engagement[]{
  const era=getEraRuleset(state.era);
  if(!era.implemented||!era.resolveCombat) throw new Error(`Era ${state.era} does not have a runnable combat implementation`);
  const contacts=detectContacts(state,state.sensors??[],era.detection);
  const engagements:Engagement[]=[];
  const seen=new Set<string>();
  for(const c of contacts){
    if(!c.detected) continue;
    const attackerCandidate=state.units[c.observerId],defender=state.units[c.targetId];
    if(!attackerCandidate||!defender) continue;
    const attacker=attackerCandidate.order?.type==='attack'?attackerCandidate:null;
    if(!attacker||attacker.side===defender.side||defender.status==='destroyed') continue;
    const key=[attacker.id,defender.id].sort().join(':');
    if(seen.has(key)) continue;
    seen.add(key);
    const context={
      attacker:contextByUnit?.[attacker.id]?.attacker,
      defender:contextByUnit?.[defender.id]?.defender,
    };
    const result=era.resolveCombat({attacker,defender,state,surprise:clamp(attacker.intelligence-defender.intelligence,-0.5,0.5),context});
    engagements.push({
      attackerId:attacker.id,defenderId:defender.id,distanceKm:c.distanceKm,detectedByAttacker:true,
      attackerLosses:result.attackerLosses,defenderLosses:result.defenderLosses,
      attackerEquipmentLosses:result.attackerEquipmentLosses,defenderEquipmentLosses:result.defenderEquipmentLosses,
      attackerAmmunitionDelta:result.attackerAmmunitionDelta,defenderAmmunitionDelta:result.defenderAmmunitionDelta,
      attackerFuelDelta:result.attackerFuelDelta,defenderFuelDelta:result.defenderFuelDelta,
      attackerReadinessDelta:result.attackerReadinessDelta,defenderReadinessDelta:result.defenderReadinessDelta,
      attackerMoraleDelta:result.attackerMoraleDelta,defenderMoraleDelta:result.defenderMoraleDelta,
      result:`${attacker.name}: -${result.attackerLosses} personnel, -${result.attackerEquipmentLosses} equipment; ${defender.name}: -${result.defenderLosses} personnel, -${result.defenderEquipmentLosses} equipment.`,
    });
  }
  return engagements;
}

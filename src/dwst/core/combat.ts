import type { CombatContextProvider } from './combatContext';
import type { ScenarioState } from './types';
import { getEraRuleset } from './eraRules';
import { detectContacts, type Contact } from './detection';
import { calculateEngagementSurprise } from './combatDetection';

export interface Engagement {
  attackerId:string; defenderId:string; distanceKm:number; detectedByAttacker:boolean;
  attackerLosses:number; defenderLosses:number; attackerEquipmentLosses:number; defenderEquipmentLosses:number;
  attackerAmmunitionDelta:number; defenderAmmunitionDelta:number; attackerFuelDelta:number; defenderFuelDelta:number;
  attackerReadinessDelta:number; defenderReadinessDelta:number; attackerMoraleDelta:number; defenderMoraleDelta:number;
  attackerSuppressionDelta:number; defenderSuppressionDelta:number; attackerDisorganizationDelta:number; defenderDisorganizationDelta:number;
  attackerAdvanceKm:number; defenderWithdrawalKm:number; defenderReserveCommitted:boolean; attackerReserveCommitted:boolean;
  phase:string; outcome:string; result:string;
}
/** Resolve engagements through the single era-owned combat ruleset. */
export function resolveEngagements(state:ScenarioState,contextProvider?:CombatContextProvider):Engagement[]{
 const era=getEraRuleset(state.era);if(!era.implemented||!era.resolveCombat)throw new Error(`Era ${state.era} does not have a runnable combat implementation`);
 const contacts=detectContacts(state,state.sensors??[],era.detection),engagements:Engagement[]=[],seen=new Set<string>();
 for(const c of contacts){
  if(!c.detected)continue;const attackerCandidate=state.units[c.observerId],defender=state.units[c.targetId];if(!attackerCandidate||!defender)continue;
  const attacker=attackerCandidate.order?.type==='attack'?attackerCandidate:null;if(!attacker||attacker.side===defender.side||defender.status==='destroyed')continue;
  const key=[attacker.id,defender.id].sort().join(':');if(seen.has(key))continue;seen.add(key);
  const attackerContext=contextProvider?.(attacker.id)?.attacker,defenderContext=contextProvider?.(defender.id)?.defender;
  const surprise=calculateEngagementSurprise(attacker.id,defender.id,attacker.intelligence,defender.intelligence,contacts);
  const result=era.resolveCombat({attacker,defender,state,distanceKm:c.distanceKm,surprise,context:{attacker:attackerContext,defender:defenderContext}});
  engagements.push({attackerId:attacker.id,defenderId:defender.id,distanceKm:c.distanceKm,detectedByAttacker:true,attackerLosses:result.attackerLosses,defenderLosses:result.defenderLosses,attackerEquipmentLosses:result.attackerEquipmentLosses,defenderEquipmentLosses:result.defenderEquipmentLosses,attackerAmmunitionDelta:result.attackerAmmunitionDelta,defenderAmmunitionDelta:result.defenderAmmunitionDelta,attackerFuelDelta:result.attackerFuelDelta,defenderFuelDelta:result.defenderFuelDelta,attackerReadinessDelta:result.attackerReadinessDelta,defenderReadinessDelta:result.defenderReadinessDelta,attackerMoraleDelta:result.attackerMoraleDelta,defenderMoraleDelta:result.defenderMoraleDelta,attackerSuppressionDelta:result.attackerSuppressionDelta,defenderSuppressionDelta:result.defenderSuppressionDelta,attackerDisorganizationDelta:result.attackerDisorganizationDelta,defenderDisorganizationDelta:result.defenderDisorganizationDelta,attackerAdvanceKm:result.attackerAdvanceKm??0,defenderWithdrawalKm:result.defenderWithdrawalKm??0,defenderReserveCommitted:result.defenderReserveCommitted??false,attackerReserveCommitted:result.attackerReserveCommitted??false,phase:result.phase,outcome:result.outcome,result:`${result.outcome} (${result.phase}): ${attacker.name} -${result.attackerLosses} personnel/-${result.attackerEquipmentLosses} equipment; ${defender.name} -${result.defenderLosses} personnel/-${result.defenderEquipmentLosses} equipment.`});
 }
 return engagements;
}

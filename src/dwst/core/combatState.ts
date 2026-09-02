import type { ResourceDelta, UnitState } from './types';

export interface CombatApplicationResult { attacker:UnitState; defender:UnitState; resourceDeltas:[ResourceDelta,ResourceDelta]; }
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const negativeDelta=(v:number|undefined)=>Math.min(0,Number.isFinite(v??0)?(v??0):0);
const positiveBounded=(v:number|undefined)=>clamp(Number.isFinite(v??0)?Math.max(0,v??0):0);

/** Apply an already-calculated combat result without mutating the input units. */
export function applyCombatResult(attacker:UnitState,defender:UnitState,result:{
  attackerLosses:number; defenderLosses:number; attackerEquipmentLosses:number; defenderEquipmentLosses:number;
  attackerAmmunitionDelta?:number; defenderAmmunitionDelta?:number; attackerFuelDelta?:number; defenderFuelDelta?:number;
  attackerReadinessDelta?:number; defenderReadinessDelta?:number; attackerMoraleDelta?:number; defenderMoraleDelta?:number;
  attackerSuppressionDelta?:number; defenderSuppressionDelta?:number; attackerDisorganizationDelta?:number; defenderDisorganizationDelta?:number;
}):CombatApplicationResult{
  const attackerLosses=Math.min(attacker.personnel,Math.max(0,result.attackerLosses));
  const defenderLosses=Math.min(defender.personnel,Math.max(0,result.defenderLosses));
  const attackerEquipmentLosses=Math.min(attacker.equipment,Math.max(0,result.attackerEquipmentLosses));
  const defenderEquipmentLosses=Math.min(defender.equipment,Math.max(0,result.defenderEquipmentLosses));
  const aAmmo=negativeDelta(result.attackerAmmunitionDelta),dAmmo=negativeDelta(result.defenderAmmunitionDelta);
  const aFuel=negativeDelta(result.attackerFuelDelta),dFuel=negativeDelta(result.defenderFuelDelta);
  const aSuppression=positiveBounded((attacker.suppression??0)+(result.attackerSuppressionDelta??0));
  const dSuppression=positiveBounded((defender.suppression??0)+(result.defenderSuppressionDelta??0));
  const aDisorganization=positiveBounded((attacker.disorganization??0)+(result.attackerDisorganizationDelta??0));
  const dDisorganization=positiveBounded((defender.disorganization??0)+(result.defenderDisorganizationDelta??0));
  const aStatus:UnitState['status']=attacker.personnel-attackerLosses<=0?'destroyed':(aDisorganization>=0.35||attacker.status==='disorganized'?'disorganized':attacker.status);
  const dStatus:UnitState['status']=defender.personnel-defenderLosses<=0?'destroyed':(dDisorganization>=0.35||defender.status==='disorganized'?'disorganized':defender.status);
  const nextAttacker={...attacker,personnel:attacker.personnel-attackerLosses,equipment:attacker.equipment-attackerEquipmentLosses,ammunition:clamp(attacker.ammunition+aAmmo),fuel:clamp(attacker.fuel+aFuel),cumulativeLosses:attacker.cumulativeLosses+attackerLosses,readiness:clamp(attacker.readiness+negativeDelta(result.attackerReadinessDelta)-attackerLosses/Math.max(attacker.personnel,1)*0.35),morale:clamp(attacker.morale+negativeDelta(result.attackerMoraleDelta)),suppression:aSuppression,disorganization:aDisorganization,status:aStatus};
  const nextDefender={...defender,personnel:defender.personnel-defenderLosses,equipment:defender.equipment-defenderEquipmentLosses,ammunition:clamp(defender.ammunition+dAmmo),fuel:clamp(defender.fuel+dFuel),cumulativeLosses:defender.cumulativeLosses+defenderLosses,readiness:clamp(defender.readiness+negativeDelta(result.defenderReadinessDelta)-defenderLosses/Math.max(defender.personnel,1)*0.35),morale:clamp(defender.morale+negativeDelta(result.defenderMoraleDelta)),suppression:dSuppression,disorganization:dDisorganization,status:dStatus};
  return {attacker:nextAttacker,defender:nextDefender,resourceDeltas:[
    {unitId:attacker.id,personnel:-attackerLosses,equipment:-attackerEquipmentLosses,ammunition:aAmmo,fuel:aFuel},
    {unitId:defender.id,personnel:-defenderLosses,equipment:-defenderEquipmentLosses,ammunition:dAmmo,fuel:dFuel},
  ]};
}

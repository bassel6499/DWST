import type { ResourceDelta, UnitState } from './types';

export interface CombatApplicationResult { attacker:UnitState; defender:UnitState; resourceDeltas:[ResourceDelta,ResourceDelta]; }
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const negativeDelta=(v:number|undefined)=>Math.min(0,Number.isFinite(v??0)?(v??0):0);

/** Apply an already-calculated combat result without mutating the input units. */
export function applyCombatResult(attacker:UnitState,defender:UnitState,result:{
  attackerLosses:number; defenderLosses:number; attackerEquipmentLosses:number; defenderEquipmentLosses:number;
  attackerAmmunitionDelta?:number; defenderAmmunitionDelta?:number; attackerFuelDelta?:number; defenderFuelDelta?:number;
  attackerReadinessDelta?:number; defenderReadinessDelta?:number; attackerMoraleDelta?:number; defenderMoraleDelta?:number;
}):CombatApplicationResult{
  const attackerLosses=Math.min(attacker.personnel,Math.max(0,result.attackerLosses));
  const defenderLosses=Math.min(defender.personnel,Math.max(0,result.defenderLosses));
  const attackerEquipmentLosses=Math.min(attacker.equipment,Math.max(0,result.attackerEquipmentLosses));
  const defenderEquipmentLosses=Math.min(defender.equipment,Math.max(0,result.defenderEquipmentLosses));
  const aAmmo=negativeDelta(result.attackerAmmunitionDelta),dAmmo=negativeDelta(result.defenderAmmunitionDelta);
  const aFuel=negativeDelta(result.attackerFuelDelta),dFuel=negativeDelta(result.defenderFuelDelta);
  const nextAttacker={...attacker,personnel:attacker.personnel-attackerLosses,equipment:attacker.equipment-attackerEquipmentLosses,ammunition:clamp(attacker.ammunition+aAmmo),fuel:clamp(attacker.fuel+aFuel),cumulativeLosses:attacker.cumulativeLosses+attackerLosses,readiness:clamp(attacker.readiness+negativeDelta(result.attackerReadinessDelta)-attackerLosses/Math.max(attacker.personnel,1)*0.35),morale:clamp(attacker.morale+negativeDelta(result.attackerMoraleDelta))};
  const nextDefender={...defender,personnel:defender.personnel-defenderLosses,equipment:defender.equipment-defenderEquipmentLosses,ammunition:clamp(defender.ammunition+dAmmo),fuel:clamp(defender.fuel+dFuel),cumulativeLosses:defender.cumulativeLosses+defenderLosses,readiness:clamp(defender.readiness+negativeDelta(result.defenderReadinessDelta)-defenderLosses/Math.max(defender.personnel,1)*0.35),morale:clamp(defender.morale+negativeDelta(result.defenderMoraleDelta))};
  return {attacker:nextAttacker,defender:nextDefender,resourceDeltas:[
    {unitId:attacker.id,personnel:-attackerLosses,equipment:-attackerEquipmentLosses,ammunition:aAmmo,fuel:aFuel},
    {unitId:defender.id,personnel:-defenderLosses,equipment:-defenderEquipmentLosses,ammunition:dAmmo,fuel:dFuel},
  ]};
}

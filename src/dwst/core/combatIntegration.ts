import type { UnitState } from './types';
import type { CrewExperiencePool } from './crewExperience';
import { crewEffectiveness } from './crewExperience';

export interface IntegratedCombatInput { attacker:UnitState; defender:UnitState; attackerCrews?:CrewExperiencePool[]; defenderCrews?:CrewExperiencePool[]; hours:number; terrainModifier?:number; weatherModifier?:number; }
export interface IntegratedCombatResult { attackerLosses:number; defenderLosses:number; attackerEquipmentLosses:number; defenderEquipmentLosses:number; attackerDestroyed:boolean; defenderDestroyed:boolean; }
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
function crewFactor(cs:CrewExperiencePool[]|undefined){return cs&&cs.length?Math.max(.25,Math.min(1,cs.reduce((s,c)=>s+crewEffectiveness(c),0)/cs.length)):1;}
function power(u:UnitState,crew:CrewExperiencePool[]|undefined,surprise=1){return Math.max(0,u.combatPower)*(0.45+0.55*clamp(u.training))*(0.45+0.55*clamp(u.experience))*(0.5+0.5*clamp(u.readiness))*(0.5+0.5*clamp(u.morale))*(0.6+0.4*clamp(u.cohesion))*(0.55+0.45*clamp(u.logistics))*(0.6+0.4*clamp(u.commandQuality))*(.6+.4*clamp(1-u.fatigue))*(.6+.4*clamp(1-u.wear))*crewFactor(crew)*surprise;}

export function resolveIntegratedCombat(i:IntegratedCombatInput):IntegratedCombatResult{
 const A=power(i.attacker,i.attackerCrews),B=power(i.defender,i.defenderCrews);
 const terrain=clamp(i.terrainModifier??1,.4,1.2),weather=clamp(i.weatherModifier??1,.5,1),scale=Math.max(1,i.hours/6);
 const aLoss=Math.min(i.attacker.personnel,Math.max(0,Math.round(.00008*B*terrain*weather*scale)));
 const dLoss=Math.min(i.defender.personnel,Math.max(0,Math.round(.00008*A*terrain*weather*scale)));
 const aEq=Math.min(i.attacker.equipment,Math.round(i.attacker.equipment*(dLoss/Math.max(1,i.defender.personnel))*.35));
 const dEq=Math.min(i.defender.equipment,Math.round(i.defender.equipment*(aLoss/Math.max(1,i.attacker.personnel))*.35));
 i.attacker.personnel-=aLoss;i.defender.personnel-=dLoss;i.attacker.equipment-=aEq;i.defender.equipment-=dEq;
 i.attacker.cumulativeLosses+=aLoss;i.defender.cumulativeLosses+=dLoss;
 if(i.attacker.personnel<=0)i.attacker.status='destroyed'; if(i.defender.personnel<=0)i.defender.status='destroyed';
 return {attackerLosses:aLoss,defenderLosses:dLoss,attackerEquipmentLosses:aEq,defenderEquipmentLosses:dEq,attackerDestroyed:i.attacker.status==='destroyed',defenderDestroyed:i.defender.status==='destroyed'};
}

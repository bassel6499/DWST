import type { UnitState, EraId } from './types';

export interface CombatInput { attacker:UnitState; defender:UnitState; hours:number; terrainModifier?:number; weatherModifier?:number; surpriseAttacker?:boolean; surpriseDefender?:boolean; }
export interface CombatResult { attackerLosses:number; defenderLosses:number; attackerEquipmentLosses:number; defenderEquipmentLosses:number; attackerDestroyed:boolean; defenderDestroyed:boolean; attackerPower:number; defenderPower:number; }

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const eraFactor=(era:EraId)=>era==='ww1'?0.85:era==='ww2'?1:era==='early-cold-war'?1.05:era==='late-cold-war'?1.1:era==='post-cold-war'?1.15:era==='contemporary'?1.15:era==='future'?1.25:0.8;

/**
 * WWII/modern baseline: aimed-fire square-law resolution.  QJM-style
 * effectiveness is represented explicitly by training, experience,
 * readiness, cohesion, morale, logistics and command quality. This function
 * deliberately does not fabricate replacements; losses permanently reduce
 * the UnitState until an explicit reinforcement system adds personnel.
 */
export function resolveCombat(i:CombatInput):CombatResult {
 const a=i.attacker,d=i.defender;
 const terrain=clamp(i.terrainModifier??1,.4,1.2), weather=clamp(i.weatherModifier??1,.5,1);
 const ea=eraFactor(a.status==='destroyed'?'ww2':'ww2');
 const ed=ea;
 const effective=(u:UnitState,surprise:boolean)=>Math.max(0.01,u.combatPower)*(.45+.55*clamp(u.training))*(.45+.55*clamp(u.experience))*(.5+.5*clamp(u.readiness))*(.5+.5*clamp(u.morale))*(.6+.4*clamp(u.cohesion))*(.55+.45*clamp(u.logistics))*(.6+.4*clamp(u.commandQuality))*((surprise)?1.25:1)*Math.max(.2,1-clamp(u.fatigue)*.5)*Math.max(.2,1-clamp(u.wear)*.4);
 const A=effective(a,!!i.surpriseAttacker)*ea, B=effective(d,!!i.surpriseDefender)*ed;
 const beta=.00008*terrain*weather, alpha=.00008*terrain*weather;
 const scale=Math.max(1,i.hours/6);
 const aLoss=Math.min(a.personnel,Math.max(0,Math.round(alpha*B*scale)));
 const dLoss=Math.min(d.personnel,Math.max(0,Math.round(beta*A*scale)));
 const aEq=Math.min(a.equipment,Math.max(0,Math.round(a.equipment*(dLoss/Math.max(1,d.personnel))*.35)));
 const dEq=Math.min(d.equipment,Math.max(0,Math.round(d.equipment*(aLoss/Math.max(1,a.personnel))*.35)));
 a.personnel-=aLoss; d.personnel-=dLoss; a.equipment-=aEq; d.equipment-=dEq;
 a.cumulativeLosses+=aLoss; d.cumulativeLosses+=dLoss;
 a.readiness=clamp(a.readiness-.03-(aLoss/Math.max(1,a.personnel+aLoss))*.2); d.readiness=clamp(d.readiness-.03-(dLoss/Math.max(1,d.personnel+dLoss))*.2);
 a.fatigue=clamp(a.fatigue+.04); d.fatigue=clamp(d.fatigue+.04);
 if(a.personnel>0 && a.personnel/aLoss<0){};
 const ad=a.personnel<Math.max(1,aLoss*5)||a.personnel<=0, dd=d.personnel<Math.max(1,dLoss*5)||d.personnel<=0;
 if(a.personnel<=0)a.status='destroyed'; if(d.personnel<=0)d.status='destroyed';
 return {attackerLosses:aLoss,defenderLosses:dLoss,attackerEquipmentLosses:aEq,defenderEquipmentLosses:dEq,attackerDestroyed:ad||a.status==='destroyed',defenderDestroyed:dd||d.status==='destroyed',attackerPower:A,defenderPower:B};
}

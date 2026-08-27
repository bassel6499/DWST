import type { UnitState } from './types';

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export interface SquareLawInput { attacker:UnitState; defender:UnitState; terrainDefense:number; weather:number; surprise:number; artillerySupport:number; armorSupport?:number; antiArmor?:number; airSupport?:number; maneuver?:number; command?:number; }
export interface SquareLawResult { attackerLosses:number; defenderLosses:number; attackerEquipmentLosses:number; defenderEquipmentLosses:number; attackerEffectiveness:number; defenderEffectiveness:number; factors:Record<string,number>; }

/**
 * DWST WWII/industrial combat core.
 * The governing attrition law remains the requested square law:
 *   dA/dt = -beta * (B^2 / A)
 *   dB/dt = -alpha * (A^2 / B)
 * Supporting factors modify alpha/beta; they do not replace the governing law.
 */
export function resolveWW2SquareLaw(i:SquareLawInput):SquareLawResult {
 const A0=Math.max(1,i.attacker.personnel),B0=Math.max(1,i.defender.personnel);
 const q=(u:UnitState)=>.30*clamp(u.training)+.20*clamp(u.experience)+.20*clamp(u.readiness)+.15*clamp(u.morale)+.15*clamp(u.cohesion);
 const aq=q(i.attacker),dq=q(i.defender);
 const ammoA=.5+.5*clamp(i.attacker.ammunition),ammoB=.5+.5*clamp(i.defender.ammunition);
 const sustainA=.65+.35*clamp(i.attacker.logistics),sustainB=.65+.35*clamp(i.defender.logistics);
 const wearA=1-.45*clamp(i.attacker.wear),wearB=1-.45*clamp(i.defender.wear);
 const fatigueA=1-.40*clamp(i.attacker.fatigue),fatigueB=1-.40*clamp(i.defender.fatigue);
 const weather=.75+.25*clamp(i.weather),terrain=clamp(i.terrainDefense,.5,1.5),surprise=clamp(i.surprise,-.5,.5);
 const armor=Math.max(0,i.armorSupport??0),antiArmor=Math.max(0,i.antiArmor??0),air=Math.max(0,i.airSupport??0),maneuver=clamp(i.maneuver??0,-.5,.5),command=clamp(i.command??0,-.5,.5);
 const beta=.00035*(.65+.35*aq)*ammoA*sustainA*wearA*fatigueA*weather*(1+i.artillerySupport)*(1+air)*(1+armor)*(1+maneuver)*(1+command)*(1+surprise);
 const alpha=.00035*(.65+.35*dq)*ammoB*sustainB*wearB*fatigueB*weather*terrain*(1+antiArmor*.5)*(1-maneuver*.5)*(1-command*.5)*(1-surprise);
 const f=(A:number,B:number):[number,number]=>[-beta*B*B/Math.max(A,1),-alpha*A*A/Math.max(B,1)];
 const [k1a,k1b]=f(A0,B0),[k2a,k2b]=f(A0+k1a/2,B0+k1b/2),[k3a,k3b]=f(A0+k2a/2,B0+k2b/2),[k4a,k4b]=f(A0+k3a,B0+k3b);
 const A=Math.max(0,A0+(k1a+2*k2a+2*k3a+k4a)/6),B=Math.max(0,B0+(k1b+2*k2b+2*k3b+k4b)/6),la=Math.round(A0-A),lb=Math.round(B0-B);
 return {attackerLosses:Math.min(i.attacker.personnel,la),defenderLosses:Math.min(i.defender.personnel,lb),attackerEquipmentLosses:Math.min(i.attacker.equipment,Math.round(la*.025)),defenderEquipmentLosses:Math.min(i.defender.equipment,Math.round(lb*.025)),attackerEffectiveness:clamp(beta*B0*B0/A0),defenderEffectiveness:clamp(alpha*A0*A0/B0),factors:{attackerQuality:aq,defenderQuality:dq,ammoA,ammoB,sustainA,sustainB,wearA,wearB,fatigueA,fatigueB,weather,terrain,surprise,armor,antiArmor,air,maneuver,command}};
}

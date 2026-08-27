import type { UnitState } from './types';

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export interface SquareLawInput { attacker:UnitState; defender:UnitState; terrainDefense:number; weather:number; surprise:number; artillerySupport:number; }
export interface SquareLawResult { attackerLosses:number; defenderLosses:number; attackerEquipmentLosses:number; defenderEquipmentLosses:number; attackerEffectiveness:number; defenderEffectiveness:number; }

/** DWST WWII/industrial core: dA/dt=-beta(B²/A), dB/dt=-alpha(A²/B). */
export function resolveWW2SquareLaw(i:SquareLawInput):SquareLawResult {
 const A0=Math.max(1,i.attacker.personnel),B0=Math.max(1,i.defender.personnel);
 const q=(u:UnitState)=>.30*clamp(u.training)+.20*clamp(u.experience)+.20*clamp(u.readiness)+.15*clamp(u.morale)+.15*clamp(u.cohesion);
 const aq=q(i.attacker),dq=q(i.defender), a=.5+.5*clamp(i.attacker.ammunition),b=.5+.5*clamp(i.defender.ammunition),sa=.65+.35*clamp(i.attacker.logistics),sb=.65+.35*clamp(i.defender.logistics),w=.75+.25*clamp(i.weather),s=clamp(i.surprise,-.5,.5);
 const beta=.00035*(.65+.35*aq)*a*sa*w*(1+i.artillerySupport)*(1+s),alpha=.00035*(.65+.35*dq)*b*sb*w*clamp(i.terrainDefense,.5,1.5)*(1-s);
 const f=(A:number,B:number):[number,number]=>[-beta*B*B/Math.max(A,1),-alpha*A*A/Math.max(B,1)];
 const [k1a,k1b]=f(A0,B0),[k2a,k2b]=f(A0+k1a/2,B0+k1b/2),[k3a,k3b]=f(A0+k2a/2,B0+k2b/2),[k4a,k4b]=f(A0+k3a,B0+k3b);
 const A=Math.max(0,A0+(k1a+2*k2a+2*k3a+k4a)/6),B=Math.max(0,B0+(k1b+2*k2b+2*k3b+k4b)/6),la=Math.round(A0-A),lb=Math.round(B0-B);
 return {attackerLosses:Math.min(i.attacker.personnel,la),defenderLosses:Math.min(i.defender.personnel,lb),attackerEquipmentLosses:Math.min(i.attacker.equipment,Math.round(la*.025)),defenderEquipmentLosses:Math.min(i.defender.equipment,Math.round(lb*.025)),attackerEffectiveness:clamp(beta*B0*B0/A0),defenderEffectiveness:clamp(alpha*A0*A0/B0)};
}

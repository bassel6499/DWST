import type { UnitState } from './types';

export interface SustainmentResult { rationUse:number; fuelUse:number; ammoUse:number; readinessLoss:number; fatigueGain:number; }
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export function resolveSustainment(u:UnitState,hours:number,combatIntensity=0):SustainmentResult {
 const h=Math.max(0,hours)/24;
 const rationUse=Math.min(u.personnel,Math.ceil(u.personnel*.025*h));
 const fuelUse=Math.ceil(Math.max(0,u.equipment)*.02*h*(u.status==='operational'?1:.5));
 const ammoUse=Math.ceil(Math.max(0,u.combatPower)*.01*h*(1+clamp(combatIntensity)));
 u.ammunition=Math.max(0,u.ammunition-ammoUse);
 u.fuel=Math.max(0,u.fuel-fuelUse);
 u.logistics=clamp(u.logistics-(fuelUse/(Math.max(1,u.fuel+fuelUse)))*.15-(ammoUse/(Math.max(1,u.ammunition+ammoUse)))*.1);
 const fatigueGain=.025*h+.05*clamp(combatIntensity)*h;
 u.fatigue=clamp(u.fatigue+fatigueGain);
 u.wear=clamp(u.wear+.01*h+.02*clamp(combatIntensity)*h);
 const readinessLoss=.02*h+.04*clamp(combatIntensity)*h;
 u.readiness=clamp(u.readiness-readinessLoss);
 if(u.personnel<=0)u.status='destroyed';
 else if(u.readiness<.2)u.status='disorganized';
 return {rationUse,fuelUse,ammoUse,readinessLoss,fatigueGain};
}

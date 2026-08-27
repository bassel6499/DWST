import type { UnitState } from './types';

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export interface CombatArmsProfile {
  directFire:number; artillery:number; armor:number; antiArmor:number; air:number; reconnaissance:number;
}

/** Explicit combat-arms contribution layer. It feeds the existing square-law alpha/beta terms. */
export function combatArms(u:UnitState):CombatArmsProfile {
  const readiness=.5+.5*clamp(u.readiness), ammo=.5+.5*clamp(u.ammunition), training=.5+.5*clamp(u.training);
  const equipment=clamp(u.equipment/Math.max(1,u.personnel/40),0,1);
  const base=readiness*ammo*training;
  return {
    directFire:base*(.55+.45*equipment),
    artillery:base*.35,
    armor:base*.30,
    antiArmor:base*.25,
    air:base*.10,
    reconnaissance:(.5+.5*clamp(u.intelligence))*(.6+.4*training),
  };
}

export function forceRatio(a:CombatArmsProfile,b:CombatArmsProfile){
 return {
  directFire:a.directFire/Math.max(.05,b.directFire),
  armor:a.armor/Math.max(.05,b.armor),
  antiArmor:a.antiArmor/Math.max(.05,b.armor),
  artillery:a.artillery/Math.max(.05,b.directFire),
  air:a.air/Math.max(.05,b.directFire),
 };
}

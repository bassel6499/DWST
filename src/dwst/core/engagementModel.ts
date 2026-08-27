import type { UnitState } from './types';
import { combatArms, type CombatArmsProfile } from './combatArms';

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export interface EngagementModifiers { artillery:number; air:number; terrainDefense:number; surprise:number; maneuver:number; command:number; }
export interface EngagementArmResult { attacker:CombatArmsProfile; defender:CombatArmsProfile; armorVsArmor:number; armorVsInfantry:number; antiArmorVsArmor:number; artilleryEffect:number; airEffect:number; }

/**
 * Explicit interaction layer for WWII formations. It does not replace the
 * square-law attrition model; it derives the alpha/beta support terms that
 * are passed to that model.
 */
export function resolveCombatArms(a:UnitState,b:UnitState,m:EngagementModifiers):EngagementArmResult {
  const A=combatArms(a),B=combatArms(b);
  const armorVsArmor=clamp((A.armor*B.armor>0 ? A.armor/Math.max(.05,B.armor) : 0));
  const armorVsInfantry=clamp(A.armor/Math.max(.05,B.directFire));
  const antiArmorVsArmor=clamp(A.antiArmor/Math.max(.05,B.armor));
  const artilleryEffect=clamp(A.artillery*(.5+.5*m.artillery));
  const airEffect=clamp(A.air*(.5+.5*m.air));
  return {attacker:A,defender:B,armorVsArmor,armorVsInfantry,antiArmorVsArmor,artilleryEffect,airEffect};
}

export function deriveSquareLawModifiers(a:UnitState,b:UnitState,m:EngagementModifiers){
 const r=resolveCombatArms(a,b,m);
 return {
   attackerArmor:0.25*r.armorVsArmor+0.35*r.armorVsInfantry,
   attackerAntiArmor:0.40*r.antiArmorVsArmor,
   attackerArtillery:0.50*r.artilleryEffect,
   attackerAir:0.30*r.airEffect,
   defenderArmor:0.25*clamp(r.defender.armor/Math.max(.05,r.attacker.armor)),
   defenderAntiArmor:0.40*clamp(r.defender.antiArmor/Math.max(.05,r.attacker.armor)),
   defenderArtillery:0.50*clamp(r.defender.artillery*(.5+.5*m.artillery)),
   defenderAir:0.30*clamp(r.defender.air*(.5+.5*m.air)),
 };
}

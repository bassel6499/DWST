import type { CombatUnitContext } from '../../core/combatContext';
import type { UnitState } from '../../core/types';
import { WW2_COMBAT_COEFFICIENTS as C } from './combatCoefficients';
import { DEFAULT_WW2_EQUIPMENT_PROFILE, WW2_EQUIPMENT_PROFILES } from './equipmentProfiles';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);
export interface WW2ForceCapability { readonly equipment:number; readonly armor:number; readonly antiArmor:number; readonly artillery:number; readonly air:number; readonly infantry:number; }
export interface WW2ForceQuality { readonly quality:number; readonly ammunition:number; readonly sustainment:number; readonly wear:number; readonly fatigue:number; readonly suppression:number; readonly disorganization:number; }
function ratio(n:number,d:number,empty=0){return d>0?clamp(n/d):empty;}
function equipmentCapability(context:CombatUnitContext|undefined){
  if(!context)return 1;
  const operational=positive(context.equipmentOperational); if(operational<=0)return 0.45;
  const readiness=ratio(context.equipmentReady,operational); const crew=ratio(context.crewReady,context.crewRequired,1);
  const serviceability=clamp(operational/Math.max(operational+context.equipmentDamaged+context.equipmentDestroyed+context.equipmentMissing,1));
  return clamp(0.35+0.30*readiness+0.20*crew+0.15*serviceability);
}
function weightedProfileCapability(context:CombatUnitContext|undefined,key:keyof typeof DEFAULT_WW2_EQUIPMENT_PROFILE){
  if(!context?.operationalEquipmentByDefinition)return 0;
  const entries=Object.entries(context.operationalEquipmentByDefinition);const total=entries.reduce((sum,[,count])=>sum+positive(count),0);if(total<=0)return 0;
  return clamp(entries.reduce((sum,[definitionId,count])=>sum+positive(count)*(WW2_EQUIPMENT_PROFILES[definitionId]??DEFAULT_WW2_EQUIPMENT_PROFILE)[key],0)/total);
}
function typeCapability(context:CombatUnitContext|undefined,types:string[]){
  if(!context)return 0;
  const total=Object.values(context.equipmentByType).reduce((a,b)=>a+b,0);const count=types.reduce((a,type)=>a+(context.equipmentByType[type]??0),0);
  return ratio(count,total);
}
export function calculateForceCapability(context:CombatUnitContext|undefined):WW2ForceCapability{
  const armor=weightedProfileCapability(context,'armor')||typeCapability(context,['tank','assaultGun','tankDestroyer']);
  const antiArmor=weightedProfileCapability(context,'antiArmor')||typeCapability(context,['antiTank','tankDestroyer']);
  const artillery=weightedProfileCapability(context,'artillery')||typeCapability(context,['artillery','selfPropelledArtillery']);
  const air=weightedProfileCapability(context,'air')||typeCapability(context,['aircraft','airSupport']);
  const personnel=positive(context?.personnel??0);
  return {equipment:equipmentCapability(context),armor,antiArmor,artillery,air,infantry:personnel>0?1:typeCapability(context,['infantry'])};
}
export function calculateMobility(unit:UnitState,capability:WW2ForceCapability){const fuelFactor=0.35+0.65*clamp(unit.fuel);const derived=(0.35+0.20*clamp(unit.readiness)+0.15*capability.armor+0.10*capability.equipment+0.20*clamp(unit.commandQuality))*fuelFactor;return clamp(unit.mobility??derived);}
/** Suppression/disorganization reduce usable quality; ammunition is a firing-capacity input. */
export function calculateForceQuality(unit:UnitState):WW2ForceQuality{
  const suppression=clamp(unit.suppression??0),disorganization=clamp(unit.disorganization??0);
  const baseQuality=C.qualityTrainingWeight*clamp(unit.training)+C.qualityExperienceWeight*clamp(unit.experience)+C.qualityReadinessWeight*clamp(unit.readiness)+C.qualityMoraleWeight*clamp(unit.morale)+C.qualityCohesionWeight*clamp(unit.cohesion);
  return{quality:baseQuality*(1-0.55*suppression)*(1-0.65*disorganization),ammunition:clamp(unit.ammunition),sustainment:C.sustainmentBase+C.sustainmentWeight*clamp(unit.logistics),wear:1-C.wearWeight*clamp(unit.wear),fatigue:1-C.fatigueWeight*clamp(unit.fatigue),suppression,disorganization};
}

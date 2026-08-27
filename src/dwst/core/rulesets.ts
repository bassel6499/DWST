import type { ScenarioState, UnitState } from './types';
import { getEraRuleset } from './eraRules';

export interface CombatRuleset {
  id:string;
  label:string;
  resolveCombat(input:{attacker:UnitState;defender:UnitState;state:ScenarioState;surprise:number}):{
    attackerLosses:number;
    defenderLosses:number;
    attackerEquipmentLosses:number;
    defenderEquipmentLosses:number;
  };
}

/** Compatibility view over the single ERA_RULESETS registry. */
function asCombatRuleset(id:string):CombatRuleset|undefined {
  const era=getEraRuleset(id as ScenarioState['era']);
  if(!era?.implemented||!era.resolveCombat)return undefined;
  return {id:era.id,label:era.label,resolveCombat:era.resolveCombat};
}

export const WWII_RULESET:CombatRuleset=asCombatRuleset('ww2')!;

export function getCombatRuleset(id:string):CombatRuleset|undefined{return asCombatRuleset(id);}
export function requireCombatRuleset(id:string):CombatRuleset{
 const ruleset=getCombatRuleset(id);
 if(!ruleset)throw new Error(`No combat ruleset is registered for era: ${id}`);
 return ruleset;
}
export function listCombatRulesets():CombatRuleset[]{
 return Object.keys({ww2:1}).map((id)=>asCombatRuleset(id)).filter((r):r is CombatRuleset=>Boolean(r));
}
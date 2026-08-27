import type { EraId } from './types';
import type { EraRuleset } from './eraRules';

export interface ScenarioRules { era:EraId; ruleset:EraRuleset; parameters:Record<string,number>; provenance?:Record<string,string>; }
export interface ToolContract { engineVersion:'dwst-v3'; deterministic:true; scenarioIsolation:true; noImplicitReplacements:true; rules:ScenarioRules; }
export function validateToolContract(c:ToolContract):string[]{const e:string[]=[];if(c.engineVersion!=='dwst-v3')e.push('Unsupported engine version');if(c.deterministic!==true)e.push('DWST core must remain deterministic');if(c.scenarioIsolation!==true)e.push('Scenario isolation must remain enabled');if(c.noImplicitReplacements!==true)e.push('Implicit replacement is prohibited');return e;}

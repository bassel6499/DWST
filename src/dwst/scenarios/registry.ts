import type { ScenarioState } from '../core/types';

export interface ScenarioDefinition {
  id:string;
  name:string;
  era:string;
  scale:'tactical'|'operational'|'strategic';
  description:string;
  create():ScenarioState;
}

const scenarios:Record<string,ScenarioDefinition>={};

export function registerScenario(s:ScenarioDefinition):void {
 if(scenarios[s.id]) throw new Error(`Scenario already registered: ${s.id}`);
 scenarios[s.id]=s;
}

export function getScenario(id:string):ScenarioDefinition|undefined{return scenarios[id];}
export function listScenarios():ScenarioDefinition[]{return Object.values(scenarios);}
export function createScenario(id:string):ScenarioState{
 const s=getScenario(id); if(!s) throw new Error(`Unknown scenario: ${id}`); return s.create();
}

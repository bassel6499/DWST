import type { ScenarioState } from '../core/types';

/** Scenario data only. It does not alter DWST engine rules or defaults. */
export interface ScenarioDefinition {
  id:string;
  title:string;
  era:'ww2';
  scale:'operational';
  turnHours:number;
  initialState:ScenarioState;
  objectives:string[];
}

/** Build the historical scenario on the canonical ScenarioState model. */
export function createArdennes1944State():ScenarioState {
  return {
    id:'ww2-ardennes-1944',
    name:'Battle of the Bulge — Operational',
    era:'ww2',
    scale:'operational',
    turnHours:6,
    elapsedHours:0,
    weather:0.5,
    terrain:0.5,
    intelLevel:0.5,
    units:{},
    events:[],
  };
}

export const Ardennes1944:ScenarioDefinition={
  id:'ww2-ardennes-1944',
  title:'Battle of the Bulge — Operational',
  era:'ww2',
  scale:'operational',
  turnHours:6,
  initialState:createArdennes1944State(),
  objectives:[
    'Maintain Allied operational coherence in the Ardennes',
    'Protect key road and urban nodes',
    'Prevent an operational breakthrough toward the Meuse',
  ],
};

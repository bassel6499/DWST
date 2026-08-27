import type { SimulationState } from '../core/simulationState';
import type { BattlefieldState } from '../core/battlefield';

/** Scenario data only. It does not alter DWST engine rules or defaults. */
export interface ScenarioDefinition { id:string; title:string; era:'ww2'; scale:'operational'; turnHours:number; battlefield:BattlefieldState; initialState:SimulationState; objectives:string[]; }

const battlefield:BattlefieldState={widthKm:180,heightKm:140,turn:0,features:{
 bastogne:{id:'bastogne',name:'Bastogne',type:'urban',position:{x:92,y:69},radiusKm:3,movementModifier:.65,defenseModifier:1.25},
 stvith:{id:'st_vith',name:'St. Vith',type:'urban',position:{x:135,y:45},radiusKm:3,movementModifier:.65,defenseModifier:1.2},
 ardennesForest:{id:'ardenne_forest',name:'Ardennes Forest',type:'forest',position:{x:105,y:65},radiusKm:55,movementModifier:.55,defenseModifier:1.15},
 ourRiver:{id:'our_river',name:'Our River',type:'river',position:{x:145,y:60},radiusKm:18,movementModifier:.65,defenseModifier:1.1}
},units:{},routes:{}};

/** Build the scenario without coupling historical data to the simulation engine. */
export function createArdennes1944State(oob:SimulationState['oob']):SimulationState{
 return {version:'dwst-v3',turn:0,elapsedHours:0,oob,battlefield:structuredClone(battlefield),intelligence:{contacts:{}}};
}

export const Ardennes1944:ScenarioDefinition={
 id:'ww2-ardennes-1944',title:'Battle of the Bulge — Operational',era:'ww2',scale:'operational',turnHours:6,battlefield,initialState:createArdennes1944State({formations:{}} as SimulationState['oob']),
 objectives:['Maintain Allied operational coherence in the Ardennes','Protect key road and urban nodes','Prevent an operational breakthrough toward the Meuse']
};

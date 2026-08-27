import type { OrderOfBattle } from './oob';
import type { BattlefieldState } from './battlefield';
import type { DetectionState } from './detection';

export interface SimulationState {
  version:'dwst-v3';
  turn:number;
  elapsedHours:number;
  oob:OrderOfBattle;
  battlefield:BattlefieldState;
  intelligence:DetectionState;
}

export function createSimulationState(oob:OrderOfBattle,battlefield:BattlefieldState):SimulationState{
 return {version:'dwst-v3',turn:0,elapsedHours:0,oob,battlefield,intelligence:{contacts:{}}};
}

export function advanceClock(state:SimulationState,hours:number):void{
 state.elapsedHours+=Math.max(0,hours);
 state.turn+=1;
 state.battlefield.turn=state.turn;
}

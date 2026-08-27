import type { OrderOfBattle } from './oob';
import type { BattlefieldState } from './battlefield';
import type { DetectionState } from './detection';
import type { CanonicalState } from './canonicalState';

export interface SimulationState {
  version:'dwst-v3';
  turn:number;
  elapsedHours:number;
  oob:OrderOfBattle;
  battlefield:BattlefieldState;
  intelligence:DetectionState;
  /** Optional canonical resource state; absent for legacy aggregate-only scenarios. */
  canonicalState?:CanonicalState;
}

export function createSimulationState(oob:OrderOfBattle,battlefield:BattlefieldState,canonicalState?:CanonicalState):SimulationState{
 return {version:'dwst-v3',turn:0,elapsedHours:0,oob,battlefield,intelligence:{contacts:{}},...(canonicalState?{canonicalState}:{})};
}

export function advanceClock(state:SimulationState,hours:number):void{
 state.elapsedHours+=Math.max(0,hours);
 state.turn+=1;
 state.battlefield.turn=state.turn;
}

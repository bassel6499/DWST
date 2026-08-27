import type { SimulationState } from './simulationState';
import type { OperationalOrder, CommandProfile } from './orders';
import { executeOrder } from './orders';
import { moveUnit } from './battlefield';
import { detect, type Sensor } from './detection';

export interface UnifiedTurnInput { hours:number; weather:number; orders:OperationalOrder[]; commands:Record<string,CommandProfile>; sensors:Sensor[]; friendlyUnitIds:Set<string>; }
export interface UnifiedTurnReport { turn:number; orderResults:ReturnType<typeof executeOrder>[]; movements:{unitId:string;movedKm:number;remainingKm:number}[]; contacts:ReturnType<typeof detect>; phases:string[]; }

export function resolveUnifiedTurn(state:SimulationState,input:UnifiedTurnInput):UnifiedTurnReport {
 const phases:string[]=[];
 phases.push('orders');
 const orderResults=input.orders.map(o=>executeOrder(state.oob,o,input.commands[o.formationId]??{training:0,experience:0,communications:0,leadership:0,doctrine:0},input.hours));
 phases.push('movement');
 const movements:UnifiedTurnReport['movements']=[];
 for(const r of orderResults){
  const order=input.orders.find(o=>o.id===r.orderId); if(!order||order.type!=='move'||r.status==='failed')continue;
  const f=state.oob.formations[order.formationId]; if(!f)continue;
  for(const unitId of f.unitIds){const m=moveUnit(state.battlefield,unitId,input.hours,input.weather);movements.push({unitId,movedKm:m.movedKm,remainingKm:m.remainingKm});}
 }
 phases.push('detection');
 const contacts=detect(state.battlefield,input.sensors,input.friendlyUnitIds,state.turn,input.weather);
 state.intelligence.contacts[`turn-${state.turn}`]=contacts;
 phases.push('combat');
 phases.push('sustainment');
 phases.push('theater-update');
 state.elapsedHours+=Math.max(0,input.hours); state.turn+=1; state.battlefield.turn=state.turn;
 return {turn:state.turn,orderResults,movements,contacts,phases};
}

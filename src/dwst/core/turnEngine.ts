import type { OrderOfBattle } from './oob';
import type { OperationalOrder, CommandProfile, OrderExecution } from './orders';
import { executeOrder } from './orders';
import type { BattlefieldState } from './battlefield';
import { moveUnit } from './battlefield';

export interface TurnContext { turn:number; hours:number; weather:number; orders:OperationalOrder[]; commands:Record<string,CommandProfile>; }
export interface TurnReport { turn:number; orderResults:OrderExecution[]; movements:{unitId:string;movedKm:number;remainingKm:number}[]; phase:string[]; }

/** Deterministic orchestration layer: orders -> movement -> later combat/logistics phases. */
export function resolveTurn(oob:OrderOfBattle,battlefield:BattlefieldState,ctx:TurnContext):TurnReport {
 const phase:string[]=[];
 phase.push('orders');
 const orderResults=ctx.orders.map(o=>executeOrder(oob,o,ctx.commands[o.formationId]??{training:0,experience:0,communications:0,leadership:0,doctrine:0},ctx.hours));
 phase.push('movement');
 const movements=[];
 for(const r of orderResults){
  const order=ctx.orders.find(o=>o.id===r.orderId);
  if(!order||order.type!=='move'||r.status==='failed')continue;
  const f=oob.formations[order.formationId];
  if(!f)continue;
  for(const unitId of f.unitIds){const result=moveUnit(battlefield,unitId,ctx.hours,ctx.weather);movements.push({unitId,movedKm:result.movedKm,remainingKm:result.remainingKm});}
 }
 phase.push('detection');
 phase.push('combat');
 phase.push('sustainment');
 phase.push('theater-update');
 battlefield.turn=ctx.turn;
 return {turn:ctx.turn,orderResults,movements,phase};
}

import type { OrderOfBattle, FormationNode } from './oob';

export type OrderType='move'|'attack'|'defend'|'withdraw'|'reinforce'|'recon'|'resupply'|'rest'|'train';
export type OrderPriority='routine'|'urgent'|'critical';

export interface CommandProfile { training:number; experience:number; communications:number; leadership:number; doctrine:number; }
export interface OperationalOrder { id:string; formationId:string; type:OrderType; objective:string; priority:OrderPriority; issuedAt:number; deadline?:number; dependencies?:string[]; }
export interface OrderExecution { orderId:string; formationId:string; completion:number; status:'pending'|'executing'|'completed'|'delayed'|'failed'; friction:number; reasons:string[]; }

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export function executeOrder(oob:OrderOfBattle,order:OperationalOrder,command:CommandProfile,turnHours:number):OrderExecution{
 const f:FormationNode|undefined=oob.formations[order.formationId];
 if(!f)return {orderId:order.id,formationId:order.formationId,completion:0,status:'failed',friction:1,reasons:['Formation not found']};
 const priority=order.priority==='critical'?1.1:order.priority==='urgent'?1.05:1;
 const commandQuality=.20*clamp(command.training)+.20*clamp(command.experience)+.20*clamp(command.communications)+.20*clamp(command.leadership)+.20*clamp(command.doctrine);
 const baseHours=Math.max(1,turnHours);
 const friction=clamp(1-commandQuality);
 const rate=(baseHours/24)*(.55+.45*commandQuality)*priority*(1-friction*.35);
 const completion=clamp(rate);
 let status:OrderExecution['status']=completion>=1?'completed':'executing';
 if(command.communications<.35)status='delayed';
 return {orderId:order.id,formationId:f.id,completion,status,friction,reasons:status==='delayed'?['Communications quality limits coordination']:[]};
}

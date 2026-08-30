import type { UnitState } from './types';

export type Echelon='team'|'squad'|'platoon'|'company'|'battalion'|'regiment'|'brigade'|'division'|'corps'|'army'|'armyGroup';
export interface EquipmentPool { type:string; operational:number; damaged:number; destroyed:number; missing?:number; }
export interface CrewExperiencePool { specialty:string; ready:number; training:number; casualties?:number; }
export interface FormationNode { id:string; name:string; echelon:Echelon; parentId?:string; childIds:string[]; unitIds:string[]; equipment:EquipmentPool[]; crews:CrewExperiencePool[]; }
export interface OrderOfBattle { formations:Record<string,FormationNode>; units:Record<string,UnitState>; }
export interface AggregatedFormation { id:string; name:string; echelon:Echelon; personnel:number; equipmentOperational:number; equipmentDestroyed:number; equipmentDamaged:number; crewReady:number; children:AggregatedFormation[]; }
export function addFormation(oob:OrderOfBattle,f:FormationNode):void{oob.formations[f.id]=f;}
export function attachChild(oob:OrderOfBattle,parentId:string,childId:string):void{const p=oob.formations[parentId],c=oob.formations[childId];if(!p||!c)return;if(!p.childIds.includes(childId))p.childIds.push(childId);c.parentId=parentId;}
export function aggregateFormation(oob:OrderOfBattle,id:string):AggregatedFormation|null{
 const f=oob.formations[id];if(!f)return null;
 const units:UnitState[]=f.unitIds.map(x=>oob.units[x]).filter((u):u is UnitState=>Boolean(u));
 const descendants:AggregatedFormation[]=f.childIds.map(x=>aggregateFormation(oob,x)).filter((a):a is AggregatedFormation=>a!==null);
 return {id:f.id,name:f.name,echelon:f.echelon,personnel:units.reduce((s,u)=>s+u.personnel,0)+descendants.reduce((s,x)=>s+x.personnel,0),equipmentOperational:f.equipment.reduce((s,e)=>s+e.operational,0),equipmentDestroyed:f.equipment.reduce((s,e)=>s+e.destroyed,0),equipmentDamaged:f.equipment.reduce((s,e)=>s+e.damaged,0),crewReady:f.crews.reduce((s,c)=>s+c.ready,0),children:descendants};
}
import type { UnitState } from './types';

export type EquipmentType='tank'|'tankDestroyer'|'atGun'|'artillery'|'spg'|'aa'|'aircraft'|'truck';
export interface EquipmentPool { type:EquipmentType; name:string; initial:number; operational:number; damaged:number; destroyed:number; }

export function equipmentReadiness(pools:EquipmentPool[]):number{
 const total=pools.reduce((s,p)=>s+p.initial,0); if(!total)return 0;
 return pools.reduce((s,p)=>s+p.operational,0)/total;
}

export function applyEquipmentLosses(pools:EquipmentPool[], personnelLosses:number, antiArmorPressure:number, artilleryPressure:number):void{
 const armor=pools.filter(p=>p.type==='tank'||p.type==='tankDestroyer'||p.type==='spg');
 const guns=pools.filter(p=>p.type==='atGun'||p.type==='artillery'||p.type==='aa');
 const armorRate=Math.min(.12, .01+antiArmorPressure*.06);
 const gunRate=Math.min(.08, .005+artilleryPressure*.04);
 for(const p of armor){const n=Math.min(p.operational,Math.round(p.operational*armorRate));p.operational-=n;p.destroyed+=Math.ceil(n*.55);p.damaged+=Math.floor(n*.45);}
 for(const p of guns){const n=Math.min(p.operational,Math.round(p.operational*gunRate));p.operational-=n;p.destroyed+=Math.ceil(n*.5);p.damaged+=Math.floor(n*.5);}
 // Personnel losses do not directly destroy equipment; this preserves independent accounting.
 void personnelLosses;
}

export function unitEquipmentMultiplier(unit:UnitState, pools:EquipmentPool[]):number{
 return .7+.3*equipmentReadiness(pools)*(.6+.4*unit.readiness);
}

import type { WorldPosition } from './spatialPosition';

export type EraId =
  | 'ancient' | 'medieval' | 'early-modern' | 'industrial' | 'ww1' | 'interwar' | 'ww2'
  | 'early-cold-war' | 'late-cold-war' | 'post-cold-war' | 'contemporary' | 'future';
export type Scale = 'tactical' | 'operational';
export type Side = 'allied' | 'enemy';
export type UnitStatus = 'operational' | 'disorganized' | 'withdrawn' | 'destroyed';

export interface UnitState {
  id:string; name:string; side:Side; parentId?:string;
  echelon:'company'|'battalion'|'brigade'|'division'|'corps'|'army';
  personnel:number; equipment:number; ammunition:number; fuel:number;
  readiness:number; training:number; experience:number; morale:number; cohesion:number;
  fatigue:number; wear:number; logistics:number; commandQuality:number; intelligence:number;
  combatPower:number; status:UnitStatus; position:WorldPosition; order?:Order;
  cumulativeLosses:number; history:UnitEvent[];
}
export interface Order { type:'move'|'attack'|'defend'|'screen'|'reserve'|'withdraw'|'recon'; objective?:string; destination?:WorldPosition; priority?:'low'|'normal'|'high'; posture?:'cautious'|'normal'|'aggressive'; text?:string; }
export interface ScenarioState { id:string; name:string; era:EraId; scale:Scale; turnHours:number; elapsedHours:number; weather:number; terrain:number; intelLevel:number; units:Record<string,UnitState>; events:SimulationEvent[]; }
export interface UnitEvent { turn:number; type:string; summary:string; personnelLosses?:number; equipmentLosses?:number; }
export interface SimulationEvent { turn:number; phase:'movement'|'combat'|'sustainment'|'command'; message:string; unitIds:string[]; }
export interface SimulationReport { turn:number; elapsedHours:number; events:SimulationEvent[]; units:UnitState[]; }
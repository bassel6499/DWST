export type Terrain='open'|'forest'|'urban'|'hill'|'marsh'|'road'|'river'|'fortification';
export interface Position { x:number; y:number; }
export interface BattlefieldFeature { id:string; name:string; type:Terrain; position:Position; radiusKm:number; movementModifier:number; defenseModifier:number; }
export interface SupplyRoute { id:string; name:string; from:string; to:string; lengthKm:number; capacity:number; interdiction:number; }
export interface BattlefieldUnit { unitId:string; position:Position; destination?:Position; movementKmPerTurn:number; terrain?:Terrain; }
export interface BattlefieldState { widthKm:number; heightKm:number; turn:number; features:Record<string,BattlefieldFeature>; units:Record<string,BattlefieldUnit>; routes:Record<string,SupplyRoute>; }

const dist=(a:Position,b:Position)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export function terrainAt(state:BattlefieldState,p:Position):BattlefieldFeature|undefined{
 return Object.values(state.features).find(f=>dist(f.position,p)<=f.radiusKm);
}

export function moveUnit(state:BattlefieldState,unitId:string,turnHours:number,weather=1):{movedKm:number;remainingKm:number;terrain?:Terrain}{
 const u=state.units[unitId]; if(!u||!u.destination)return {movedKm:0,remainingKm:0};
 const d=dist(u.position,u.destination); if(d===0)return {movedKm:0,remainingKm:0};
 const feature=terrainAt(state,u.position); const terrain=feature?.type; const modifier=feature?.movementModifier??1;
 const available=Math.max(0,u.movementKmPerTurn*(turnHours/24)*modifier*clamp(weather,.5,1));
 const moved=Math.min(d,available); const r=moved/d;
 u.position={x:u.position.x+(u.destination.x-u.position.x)*r,y:u.position.y+(u.destination.y-u.position.y)*r};
 return {movedKm:moved,remainingKm:d-moved,terrain};
}

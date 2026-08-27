import type { ScenarioState, UnitState } from './types';

const clamp = (v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const km=(a:UnitState['position'],b:UnitState['position'])=>{const y=(b.lat-a.lat)*111;const x=(b.lon-a.lon)*111*Math.cos(((a.lat+b.lat)/2)*Math.PI/180);return Math.hypot(x,y)};

export interface Contact { observerId:string; targetId:string; distanceKm:number; probability:number; detected:boolean; }

/** WWII baseline detection: distance, intelligence, readiness, terrain and weather.
 * Values are explicit/tunable and deterministic; no hidden randomness. */
export function detectContacts(state:ScenarioState):Contact[]{
 const out:Contact[]=[]; const units=Object.values(state.units).filter(u=>u.status!=='destroyed');
 for(const a of units) for(const b of units){
  if(a.side===b.side||a.id===b.id) continue;
  const d=km(a.position,b.position);
  const range=12*(0.65+0.35*clamp(a.intelligence))*(0.7+0.3*clamp(a.readiness))*(0.65+0.35*clamp(state.weather));
  const terrainFactor=0.75+0.25*clamp(state.terrain);
  const probability=clamp((range*Math.max(0.1,terrainFactor))/Math.max(d,0.1));
  out.push({observerId:a.id,targetId:b.id,distanceKm:d,probability,detected:probability>=1});
 }
 return out;
}

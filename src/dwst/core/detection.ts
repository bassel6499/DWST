import { geographicDistanceMeters } from './geographicMovement';
import type { ScenarioState, UnitState } from './types';

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const km=(a:UnitState['position'],b:UnitState['position'])=>geographicDistanceMeters(a,b)/1000;
export type SensorType='visual'|'recon'|'airRecon'|'signals';
export interface Sensor { id:string; unitId:string; type:SensorType; rangeKm:number; quality:number; }
export interface Contact { observerId:string; targetId:string; distanceKm:number; probability:number; detected:boolean; confidence:'unknown'|'unit'|'formation'; }
export interface DetectionState { contacts:Record<string,Contact[]>; }
function sensorModifier(t:SensorType){return t==='visual'?1:t==='recon'?1.25:t==='airRecon'?1.7:1.1;}

/** Canonical detection over ScenarioState and geographic WorldPosition. */
export function detectContacts(state:ScenarioState,sensors:Sensor[]=[]):Contact[]{
 const out:Contact[]=[];const units=Object.values(state.units).filter(u=>u.status!=='destroyed');
 for(const a of units)for(const b of units){if(a.side===b.side||a.id===b.id)continue;const d=km(a.position,b.position);const matching=sensors.filter(s=>s.unitId===a.id);const sensorBoost=matching.length?Math.max(...matching.map(s=>s.rangeKm*sensorModifier(s.type)*clamp(s.quality))):12;const range=sensorBoost*(.65+.35*clamp(a.intelligence))*(.7+.3*clamp(a.readiness))*(.65+.35*clamp(state.weather));const probability=clamp((range*(.75+.25*clamp(state.terrain)))/Math.max(d,.1));out.push({observerId:a.id,targetId:b.id,distanceKm:d,probability,detected:probability>=1,confidence:probability>.85?'formation':probability>.55?'unit':'unknown'});}
 return out;
}

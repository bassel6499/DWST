import { describe, expect, it } from 'vitest';
import { evaluateWW2Calibration } from './calibration';
import type { UnitState } from '../../core/types';
import type { WW2CombatInput } from './combat';

const unit=(id:string,overrides:Partial<UnitState>={}):UnitState=>({id,name:id,side:id==='a'?'allied':'enemy',echelon:'division',personnel:10_000,equipment:500,combatPower:1,readiness:0.8,logistics:0.8,fatigue:0.1,wear:0.1,training:0.7,experience:0.7,morale:0.7,cohesion:0.7,commandQuality:0.7,intelligence:0.7,ammunition:0.8,fuel:0.8,position:{lon:35.5,lat:33.9},status:'operational',cumulativeLosses:0,history:[],...overrides});
const base=():WW2CombatInput=>({attacker:unit('a'),defender:unit('d'),terrainDefense:1,weather:1,surprise:0,distanceKm:5});

describe('WW2 calibration harness',()=>{
 it('passes deterministic qualitative calibration invariants',()=>{
  const cases=[
   {id:'quality',baseline:base(),variant:{...base(),attacker:unit('a',{training:1,experience:1,morale:1,cohesion:1,readiness:1})},assertions:[(b:any,v:any)=>v.attackerEffectiveness>b.attackerEffectiveness]},
   {id:'range',baseline:{...base(),distanceKm:15},variant:{...base(),distanceKm:2},assertions:[(b:any,v:any)=>v.factors.rangeA>b.factors.rangeA]},
   {id:'condition',baseline:{...base(),attacker:unit('a',{fatigue:1,wear:1,logistics:0,morale:0})},variant:{...base(),attacker:unit('a',{fatigue:0,wear:0,logistics:1,morale:1})},assertions:[(b:any,v:any)=>v.attackerEffectiveness>b.attackerEffectiveness]},
   {id:'determinism',baseline:base(),variant:base(),assertions:[(b:any,v:any)=>JSON.stringify(b)===JSON.stringify(v)]},
  ];
  expect(evaluateWW2Calibration(cases).every((result)=>result.passed)).toBe(true);
 });
});

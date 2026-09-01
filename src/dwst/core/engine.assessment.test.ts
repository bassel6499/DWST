import { describe, expect, it } from 'vitest';
import type { ScenarioState, UnitState } from './types';
import { getEraRuleset } from './eraRules';
import { captureSimulationBaseline } from './simulationBaseline';
import { resolveTurn } from './engine';

const unit=(personnel:number):UnitState=>({
  id:'u1',name:'Test',side:'allied',echelon:'battalion',personnel,equipment:100,ammunition:1,fuel:1,
  readiness:1,training:1,experience:1,morale:1,cohesion:1,fatigue:0,wear:0,logistics:1,commandQuality:1,intelligence:1,
  combatPower:100,status:'operational',position:{lon:0,lat:0},cumulativeLosses:0,history:[],
});

const scenario=(u:UnitState):ScenarioState=>({
  id:'s',name:'Scenario',era:'ww2',scale:'tactical',turnHours:6,elapsedHours:0,weather:1,terrain:1,intelLevel:1,
  units:{[u.id]:u},events:[],
});

describe('resolveTurn unit assessment integration',()=>{
  it('applies the selected era assessment policy when a baseline is supplied',()=>{
    const rules=getEraRuleset('ww2');
    const initial=unit(1000);
    const baseline=captureSimulationBaseline(scenario(initial));
    const result=resolveTurn(scenario({...initial,personnel:500}),rules,baseline);
    expect(result.units[0].status).toBe('disorganized');
  });

  it('does not require a baseline for existing engine callers',()=>{
    const initial=unit(1000);
    const result=resolveTurn(scenario(initial),getEraRuleset('ww2'));
    expect(result.units[0].status).toBe('operational');
  });
});

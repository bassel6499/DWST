import { describe, expect, it } from 'vitest';
import type { UnitState } from './types';
import { assessUnit } from './unitAssessment';
import { captureSimulationBaseline } from './simulationBaseline';

const unit=(personnel:number):UnitState=>({
  id:'u1',name:'Test',side:'allied',echelon:'battalion',personnel,equipment:100,ammunition:1,fuel:1,
  readiness:1,training:1,experience:1,morale:1,cohesion:1,fatigue:0,wear:0,logistics:1,commandQuality:1,intelligence:1,
  combatPower:100,status:'operational',position:{lon:0,lat:0},cumulativeLosses:0,history:[],
});

const state=(u:UnitState)=>({id:'s',name:'Scenario',era:'ww2' as const,scale:'tactical' as const,turnHours:6,elapsedHours:0,weather:1,terrain:1,intelLevel:1,units:{[u.id]:u},events:[]});
const thresholds={destroyedPersonnel:0.2,disorganizedPersonnel:0.5,disorganizedCondition:0.4};

describe('assessUnit',()=>{
  it('uses the simulation-start baseline rather than an absolute personnel threshold',()=>{
    const u=unit(1000); const baseline=captureSimulationBaseline(state(u));
    expect(assessUnit({...u,personnel:500},baseline,thresholds).status).toBe('disorganized');
    const large=unit(5000); const largeBaseline=captureSimulationBaseline(state(large));
    expect(assessUnit({...large,personnel:2500},largeBaseline,thresholds).status).toBe('disorganized');
  });

  it('marks a unit destroyed at the configured personnel threshold',()=>{
    const u=unit(1000); const baseline=captureSimulationBaseline(state(u));
    const result=assessUnit({...u,personnel:200},baseline,thresholds);
    expect(result.status).toBe('destroyed');
    expect(result.relativePersonnel).toBe(0.2);
  });

  it('can mark a withdrawing unit withdrawn when it is not otherwise degraded',()=>{
    const u=unit(1000); const baseline=captureSimulationBaseline(state(u));
    const result=assessUnit({...u,order:{type:'withdraw'}},baseline,thresholds);
    expect(result.status).toBe('withdrawn');
  });

  it('does not mutate the unit',()=>{
    const u=unit(1000); const baseline=captureSimulationBaseline(state(u));
    const before=structuredClone(u);
    assessUnit({...u,personnel:500,morale:0.2},baseline,thresholds);
    expect(u).toEqual(before);
  });
});

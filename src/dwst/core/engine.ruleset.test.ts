import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { getEraRuleset } from './eraRules';
import { resolveTurn } from './engine';
import type { ScenarioState } from './types';

const scenario=():ScenarioState=>({
 id:'ruleset-test',name:'Ruleset test',era:'ww2',scale:'tactical',turnHours:6,elapsedHours:0,
 weather:1,terrain:1,intelLevel:1,events:[],units:{
  u1:{id:'u1',name:'Unit',side:'allied',echelon:'company',personnel:100,equipment:10,ammunition:1,fuel:1,readiness:1,training:1,experience:1,morale:1,cohesion:1,fatigue:0,wear:0,logistics:1,commandQuality:1,intelligence:1,combatPower:100,status:'operational',position:{lon:0,lat:0},order:{type:'move',destination:{lon:1,lat:0}},cumulativeLosses:0,history:[]}
 }
});

describe('engine ruleset boundary',()=>{
 it('uses the selected era ruleset without changing the generic state contract',()=>{
  const state=scenario();
  resolveTurn(state,getEraRuleset('ww2'));
  assert.ok(state.units.u1.position.lon>0);
 });
 it('allows ruleset coefficients to change engine behavior',()=>{
  const state=scenario();
  const rules={...getEraRuleset('ww2'),engine:{...getEraRuleset('ww2').engine,movementHours:12}};
  resolveTurn(state,rules);
  assert.equal(state.units.u1.position.lon,0.5);
 });
 it('does not silently substitute WWII for another era',()=>{
  const state=scenario(); state.era='contemporary';
  const modern=getEraRuleset('contemporary');
  assert.equal(modern.id,'contemporary');
  assert.notEqual(modern.id,'ww2');
  resolveTurn(state,modern);
  assert.ok(state.units.u1.position.lon>0);
 });
});

import { strict as assert } from 'node:assert';
import { describe,it } from 'vitest';
import { ERA_RULESETS,getEraRuleset,getImplementedEraRulesets,validateEraRuleset } from './eraRules';

describe('era ruleset registry',()=>{
 it('exposes only validated runnable eras as implemented',()=>{
  const implemented=getImplementedEraRulesets();
  assert.deepEqual(implemented.map((r)=>r.id),['ww2']);
  assert.equal(getEraRuleset('ww2').implemented,true);
  assert.equal(getEraRuleset('contemporary').implemented,false);
 });
 it('keeps future eras as explicit scaffolds rather than pretending they are runnable',()=>{
  for(const ruleset of Object.values(ERA_RULESETS)) assert.equal(validateEraRuleset(ruleset).length,0);
  assert.match(getEraRuleset('future').notes[0],/not runnable/);
 });
});

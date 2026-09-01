import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { getCombatRuleset, listCombatRulesets, requireCombatRuleset } from './rulesets';

describe('combat rulesets',()=>{
 it('registers WWII as the first concrete combat ruleset',()=>{
  const ruleset=getCombatRuleset('ww2');
  assert.ok(ruleset);
  assert.equal(ruleset.id,'ww2');
  assert.equal(listCombatRulesets().length,1);
 });
 it('does not pretend unsupported eras have implementations',()=>{
  assert.equal(getCombatRuleset('modern'),undefined);
  assert.throws(()=>requireCombatRuleset('modern'),/No combat ruleset is registered/);
 });
});

import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { ERA_RULESETS, getEraRuleset, getImplementedEraRulesets } from './eraRules';

describe('era ruleset isolation', () => {
  it('freezes the shared ruleset registry and nested configuration', () => {
    const ruleset = getEraRuleset('ww2');
    assert.equal(Object.isFrozen(ERA_RULESETS), true);
    assert.equal(Object.isFrozen(ruleset), true);
    assert.equal(Object.isFrozen(ruleset.engine), true);
    assert.equal(Object.isFrozen(ruleset.unitAssessment), true);
    assert.equal(Object.isFrozen(ruleset.detection), true);
    assert.equal(Object.isFrozen(ruleset.detection.sensorRangeModifiers), true);
    assert.equal(Object.isFrozen(ruleset.notes), true);
  });

  it('prevents one simulation caller from mutating shared era configuration', () => {
    const first = getEraRuleset('ww2');
    const second = getEraRuleset('ww2');
    assert.equal(first.engine.movementHours, 6);
    assert.equal(second.engine.movementHours, 6);
    assert.throws(() => { (first.engine as { movementHours: number }).movementHours = 99; }, TypeError);
    assert.equal(second.engine.movementHours, 6);
    assert.throws(() => { (first.detection.sensorRangeModifiers as Record<string, number>).visual = 99; }, TypeError);
    assert.equal(second.detection.sensorRangeModifiers.visual, 1);
    assert.throws(() => { (first.notes as string[]).push('caller mutation'); }, TypeError);
    assert.equal(second.notes.length, 1);
  });

  it('keeps implemented-era discovery behavior unchanged', () => {
    assert.deepEqual(getImplementedEraRulesets().map((ruleset) => ruleset.id), ['ww2']);
  });
});

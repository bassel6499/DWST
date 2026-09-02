import { describe, expect, it } from 'vitest';
import { resolveWW2Combat } from './combat';
import type { UnitState } from '../../core/types';

const makeUnit = (id: string, overrides: Partial<UnitState> = {}): UnitState => ({
  id,
  name: id,
  side: id === 'a' ? 'allied' : 'enemy',
  echelon: 'division',
  personnel: 10_000,
  equipment: 500,
  ammunition: 0.8,
  fuel: 0.8,
  readiness: 0.8,
  training: 0.7,
  experience: 0.7,
  morale: 0.7,
  cohesion: 0.7,
  fatigue: 0.1,
  wear: 0.1,
  logistics: 0.8,
  commandQuality: 0.7,
  intelligence: 0.7,
  combatPower: 1,
  status: 'operational',
  position: { lon: 35.5, lat: 33.9 },
  cumulativeLosses: 0,
  history: [],
  ...overrides,
});

const baseInput = (overrides: Partial<Parameters<typeof resolveWW2Combat>[0]> = {}) => ({
  attacker: makeUnit('a'),
  defender: makeUnit('d'),
  terrainDefense: 1,
  weather: 1,
  surprise: 0,
  distanceKm: 5,
  ...overrides,
});

describe('WW2 Wave-3 validation', () => {
  it('treats ammunition as a true firing-capacity constraint', () => {
    const armed = resolveWW2Combat(baseInput());
    const empty = resolveWW2Combat(baseInput({ attacker: makeUnit('a', { ammunition: 0 }) }));
    expect(empty.factors.offenseA).toBe(0);
    expect(empty.defenderLosses).toBeLessThanOrEqual(armed.defenderLosses);
  });

  it('lets fuel availability constrain mobility', () => {
    const fueled = resolveWW2Combat(baseInput());
    const empty = resolveWW2Combat(baseInput({ attacker: makeUnit('a', { fuel: 0 }) }));
    expect(empty.factors.attackerMobility).toBeLessThan(fueled.factors.attackerMobility);
  });

  it('carries suppression and disorganization into the next resolution', () => {
    const clean = resolveWW2Combat(baseInput());
    const suppressed = resolveWW2Combat(baseInput({
      attacker: makeUnit('a', { suppression: 0.8, disorganization: 0.6 }),
    }));
    expect(suppressed.factors.attackerQuality).toBeLessThan(clean.factors.attackerQuality);
    expect(suppressed.factors.offenseA).toBeLessThan(clean.factors.offenseA);
  });

  it('distinguishes terrain classes without creating coordinate conversions', () => {
    const open = resolveWW2Combat(baseInput({ terrainType: 'open' }));
    const urban = resolveWW2Combat(baseInput({ terrainType: 'urban' }));
    expect(urban.factors.exposureA).toBeLessThan(open.factors.exposureA);
    expect(urban.factors.lineOfSight).toBeLessThan(open.factors.lineOfSight);
  });

  it('changes phase behavior as range changes', () => {
    const approach = resolveWW2Combat(baseInput({ distanceKm: 25 }));
    const preparation = resolveWW2Combat(baseInput({ distanceKm: 10 }));
    const engagement = resolveWW2Combat(baseInput({ distanceKm: 5 }));
    const assault = resolveWW2Combat(baseInput({ distanceKm: 2 }));
    expect(approach.phase).toBe('approach');
    expect(preparation.phase).toBe('preparation');
    expect(engagement.phase).toBe('main_engagement');
    expect(assault.phase).toBe('assault');
  });

  it('uses command quality to bound reserve response time', () => {
    const strong = resolveWW2Combat(baseInput({ defender: makeUnit('d', { commandQuality: 1, reserveFraction: 0.4 }) }));
    const weak = resolveWW2Combat(baseInput({ defender: makeUnit('d', { commandQuality: 0, reserveFraction: 0.4 }) }));
    expect(strong.factors.localRatio).toBeGreaterThan(0);
    expect(weak.factors.localRatio).toBeGreaterThan(0);
  });

  it('remains deterministic for identical inputs', () => {
    const a = resolveWW2Combat(baseInput({ terrainType: 'forest', distanceKm: 12 }));
    const b = resolveWW2Combat(baseInput({ terrainType: 'forest', distanceKm: 12 }));
    expect(a).toEqual(b);
  });
});

import { describe, expect, it } from 'vitest';
import { resolveWW2Combat } from './combat';
import type { UnitState } from '../../core/types';

const unit = (id: string, overrides: Partial<UnitState> = {}): UnitState => ({
  id,
  name: id,
  side: 'allied',
  echelon: 'division',
  personnel: 10_000,
  equipment: 500,
  combatPower: 1,
  readiness: 0.8,
  logistics: 0.8,
  fatigue: 0.1,
  wear: 0.1,
  training: 0.7,
  experience: 0.7,
  morale: 0.7,
  cohesion: 0.7,
  commandQuality: 0.7,
  intelligence: 0.7,
  ammunition: 0.8,
  fuel: 0.8,
  position: { lon: 35.5, lat: 33.9 },
  status: 'operational',
  cumulativeLosses: 0,
  history: [],
  ...overrides,
});

const input = (overrides: Record<string, unknown> = {}) => ({
  attacker: unit('attacker'),
  defender: unit('defender', { side: 'enemy' }),
  terrainDefense: 1,
  weather: 1,
  surprise: 0,
  artillerySupport: 0,
  ...overrides,
});

describe('WW2 selectable combat ruleset', () => {
  it('produces finite non-negative bounded losses', () => {
    const result = resolveWW2Combat(input());
    expect(result.attackerLosses).toBeGreaterThanOrEqual(0);
    expect(result.defenderLosses).toBeGreaterThanOrEqual(0);
    expect(result.attackerLosses).toBeLessThanOrEqual(10_000);
    expect(result.defenderLosses).toBeLessThanOrEqual(10_000);
    expect(Number.isFinite(result.attackerEffectiveness)).toBe(true);
    expect(Number.isFinite(result.defenderEffectiveness)).toBe(true);
  });

  it('keeps supporting factors visible without replacing the governing law', () => {
    const base = resolveWW2Combat(input());
    const supported = resolveWW2Combat(input({ artillerySupport: 0.5, airSupport: 0.25 }));
    expect(supported.defenderLosses).toBeGreaterThanOrEqual(base.defenderLosses);
    expect(supported.factors.armor).toBe(0);
    expect(supported.factors.air).toBe(0.25);
  });

  it('honors defender terrain advantage as a defender-side combat factor', () => {
    const open = resolveWW2Combat(input({ terrainDefense: 0.5 }));
    const defended = resolveWW2Combat(input({ terrainDefense: 1.5 }));
    expect(defended.defenderEffectiveness).toBeGreaterThanOrEqual(open.defenderEffectiveness);
  });

  it('remains era-local and operates on canonical UnitState inputs', () => {
    const result = resolveWW2Combat(input({
      attacker: unit('attacker', { position: { lon: 179, lat: 10 } }),
      defender: unit('defender', { side: 'enemy', position: { lon: -179, lat: 10 } }),
    }));
    expect(result.attackerLosses).toBeGreaterThanOrEqual(0);
    expect(result.defenderLosses).toBeGreaterThanOrEqual(0);
  });
});

import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import type { UnitState } from './types';
import { applyCombatResult } from './combatState';

const unit = (id: string): UnitState => ({
  id, name: id, side: id === 'a' ? 'allied' : 'enemy', echelon: 'battalion',
  personnel: 10, equipment: 5, ammunition: 1, fuel: 1,
  readiness: 1, training: 1, experience: 1, morale: 1, cohesion: 1,
  fatigue: 0, wear: 0, logistics: 1, commandQuality: 1, intelligence: 1,
  combatPower: 100, status: 'operational', position: { lat: 0, lon: 0 },
  cumulativeLosses: 0, history: [], order: { type: 'attack' },
});

describe('combat resource deltas', () => {
  it('returns the applied losses explicitly without reconstructing them from UnitState', () => {
    const result = applyCombatResult(unit('a'), unit('d'), {
      attackerLosses: 2,
      defenderLosses: 3,
      attackerEquipmentLosses: 1,
      defenderEquipmentLosses: 2,
    });

    assert.deepEqual(result.resourceDeltas, [
      { unitId: 'a', personnel: -2, equipment: -1, ammunition: 0, fuel: 0 },
      { unitId: 'd', personnel: -3, equipment: -2, ammunition: 0, fuel: 0 },
    ]);
    assert.equal(result.attacker.personnel, 8);
    assert.equal(result.defender.equipment, 3);
  });
});

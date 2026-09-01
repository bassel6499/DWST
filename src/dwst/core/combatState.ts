import type { ResourceDelta, UnitState } from './types';

export interface CombatApplicationResult {
  attacker: UnitState;
  defender: UnitState;
  resourceDeltas: [ResourceDelta, ResourceDelta];
}

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

/** Apply an already-calculated combat result without mutating the input units. */
export function applyCombatResult(
  attacker: UnitState,
  defender: UnitState,
  result: {
    attackerLosses: number;
    defenderLosses: number;
    attackerEquipmentLosses: number;
    defenderEquipmentLosses: number;
  },
): CombatApplicationResult {
  const attackerLosses = Math.min(attacker.personnel, Math.max(0, result.attackerLosses));
  const defenderLosses = Math.min(defender.personnel, Math.max(0, result.defenderLosses));
  const attackerEquipmentLosses = Math.min(attacker.equipment, Math.max(0, result.attackerEquipmentLosses));
  const defenderEquipmentLosses = Math.min(defender.equipment, Math.max(0, result.defenderEquipmentLosses));

  const nextAttacker = {
    ...attacker,
    personnel: attacker.personnel - attackerLosses,
    equipment: attacker.equipment - attackerEquipmentLosses,
    cumulativeLosses: attacker.cumulativeLosses + attackerLosses,
    readiness: clamp(attacker.readiness - attackerLosses / Math.max(attacker.personnel, 1) * 0.35),
  };
  const nextDefender = {
    ...defender,
    personnel: defender.personnel - defenderLosses,
    equipment: defender.equipment - defenderEquipmentLosses,
    cumulativeLosses: defender.cumulativeLosses + defenderLosses,
    readiness: clamp(defender.readiness - defenderLosses / Math.max(defender.personnel, 1) * 0.35),
  };

  return {
    attacker: nextAttacker,
    defender: nextDefender,
    resourceDeltas: [
      { unitId: attacker.id, personnel: -attackerLosses, equipment: -attackerEquipmentLosses, ammunition: 0, fuel: 0 },
      { unitId: defender.id, personnel: -defenderLosses, equipment: -defenderEquipmentLosses, ammunition: 0, fuel: 0 },
    ],
  };
}

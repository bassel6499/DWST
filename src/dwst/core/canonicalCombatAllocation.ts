import type { CanonicalState } from './canonicalState';
import type {
  CanonicalCombatCommit,
  CombatEquipmentDisposition,
  CombatPersonnelDisposition,
} from './canonicalCombatCommit';

export interface CombatLossCounts {
  personnel: number;
  equipment: number;
}

/**
 * The allocation policy is intentionally explicit. The generic allocator does
 * not infer casualty identities, dispositions, or historical casualty patterns.
 */
export interface CombatAllocationPolicy {
  personnelDisposition: CombatPersonnelDisposition;
  equipmentDisposition: CombatEquipmentDisposition;
  eligiblePersonnelStatuses: ReadonlyArray<'available' | 'training' | 'assigned'>;
  eligibleEquipmentStatuses: ReadonlyArray<'operational' | 'damaged'>;
  selection: 'stable-id';
}

function requireNonNegativeInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
}

/**
 * Convert aggregate combat losses into explicit canonical record IDs.
 *
 * This is deliberately a generic accounting policy, not a casualty model.
 * Identity selection is deterministic and inspectable: candidates are limited
 * to the source unit and explicitly eligible statuses, then selected by stable
 * canonical ID ordering. A future era-specific model may provide a different
 * explicit policy without changing the canonical commit contract.
 */
export function allocateCombatLosses(
  state: CanonicalState,
  unitId: string,
  losses: CombatLossCounts,
  policy: CombatAllocationPolicy,
): CanonicalCombatCommit {
  if (!unitId) throw new Error('Combat allocation requires a unitId');
  requireNonNegativeInteger(losses.personnel, 'Personnel losses');
  requireNonNegativeInteger(losses.equipment, 'Equipment losses');
  if (policy.selection !== 'stable-id') {
    throw new Error(`Unsupported combat allocation selection: ${policy.selection}`);
  }

  const personnel = state.personnel.personnel
    .filter((record) => record.unitId === unitId && policy.eligiblePersonnelStatuses.includes(record.status))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (losses.personnel > personnel.length) {
    throw new Error(`Personnel loss allocation exceeds eligible personnel for unit ${unitId}`);
  }

  const equipment = state.equipment
    .filter((instance) => instance.unitId === unitId && policy.eligibleEquipmentStatuses.includes(instance.status))
    .sort((a, b) => a.instanceId.localeCompare(b.instanceId));

  if (losses.equipment > equipment.length) {
    throw new Error(`Equipment loss allocation exceeds eligible equipment for unit ${unitId}`);
  }

  return {
    personnel: personnel.slice(0, losses.personnel).map((record) => ({
      personnelId: record.id,
      disposition: policy.personnelDisposition,
    })),
    equipment: equipment.slice(0, losses.equipment).map((instance) => ({
      instanceId: instance.instanceId,
      disposition: policy.equipmentDisposition,
    })),
  };
}

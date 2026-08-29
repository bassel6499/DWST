import type { CanonicalState } from './canonicalState';
import { projectCanonicalUnit, type CanonicalUnitProjection } from './canonicalProjection';

export interface CanonicalUnitResources {
  personnel: number;
  equipment: number;
  ammunition: number;
  fuel: number;
  equipmentOperational: number;
  equipmentDamaged: number;
  equipmentDestroyed: number;
  equipmentMissing: number;
  crewRequired: number;
  crewReady: number;
  equipmentReady: number;
  /** Fraction of operational equipment that is fully crew-ready; not UnitState.readiness. */
  equipmentReadiness: number;
}

/** Pure adapter from authoritative canonical records to resource-only simulation inputs. */
export function projectCanonicalUnitResources(
  unitId: string,
  canonicalState: CanonicalState,
): CanonicalUnitResources {
  const projection: CanonicalUnitProjection = projectCanonicalUnit(
    unitId,
    canonicalState.personnel,
    canonicalState.equipment,
    canonicalState.crewAssignments,
    canonicalState.equipmentDefinitions,
    canonicalState.consumables,
  );

  const equipmentReadiness = projection.equipmentOperational === 0
    ? 0
    : projection.equipmentReady / projection.equipmentOperational;

  return {
    personnel: projection.personnel,
    equipment: projection.equipment,
    ammunition: projection.ammunition,
    fuel: projection.fuel,
    equipmentOperational: projection.equipmentOperational,
    equipmentDamaged: projection.equipmentDamaged,
    equipmentDestroyed: projection.equipmentDestroyed,
    equipmentMissing: projection.equipmentMissing,
    crewRequired: projection.crewRequired,
    crewReady: projection.crewReady,
    equipmentReady: projection.equipmentReady,
    equipmentReadiness,
  };
}

import type { CanonicalState } from './canonicalState';
import { projectCanonicalUnit } from './canonicalProjection';
import type { ScenarioState } from './types';

/**
 * Reconcile legacy unit resource aggregates from authoritative canonical records.
 * Personnel, equipment, ammunition, and fuel are all projected from CanonicalState;
 * operational state (position, readiness, fatigue, etc.) remains untouched.
 */
export function reconcileScenarioResourceAggregates(
  state: ScenarioState,
  canonical: CanonicalState,
): ScenarioState {
  const units = Object.fromEntries(
    Object.values(state.units).map((unit) => {
      const projection = projectCanonicalUnit(
        unit.id,
        canonical.personnel,
        canonical.equipment,
        canonical.crewAssignments,
        canonical.equipmentDefinitions,
        canonical.consumables,
      );

      const hasPersonnelCoverage = canonical.personnel.personnel.some((record) => record.unitId === unit.id);
      const hasEquipmentCoverage = canonical.equipment.some((instance) => instance.unitId === unit.id);
      const hasConsumableCoverage = canonical.consumables.some((record) => record.unitId === unit.id);

      if (unit.personnel !== 0 && !hasPersonnelCoverage) {
        throw new Error(`Missing canonical personnel coverage for unit ${unit.id}`);
      }
      if (unit.equipment !== 0 && !hasEquipmentCoverage) {
        throw new Error(`Missing canonical equipment coverage for unit ${unit.id}`);
      }
      if (!hasConsumableCoverage) {
        throw new Error(`Missing canonical consumable coverage for unit ${unit.id}`);
      }

      return [unit.id, {
        ...unit,
        personnel: projection.personnel,
        equipment: projection.equipment,
        ammunition: projection.ammunition,
        fuel: projection.fuel,
      }];
    }),
  );

  return { ...state, units };
}
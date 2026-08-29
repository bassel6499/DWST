import type { CanonicalState } from './canonicalState';
import { projectCanonicalUnit } from './canonicalProjection';
import type { ScenarioState } from './types';

/**
 * Reconcile only the legacy unit resource aggregates from authoritative
 * canonical records. Operational state (position, readiness, fatigue, etc.) is
 * deliberately preserved untouched.
 *
 * Canonical ownership coverage is explicit: a non-zero legacy aggregate may
 * not silently become zero merely because its detailed canonical records are
 * missing. This keeps incomplete canonicalization visible instead of turning a
 * missing data problem into a plausible-looking state.
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
      );

      const hasPersonnelCoverage = canonical.personnel.personnel.some((record) => record.unitId === unit.id);
      const hasEquipmentCoverage = canonical.equipment.some((instance) => instance.unitId === unit.id);

      if (unit.personnel !== 0 && !hasPersonnelCoverage) {
        throw new Error(`Missing canonical personnel coverage for unit ${unit.id}`);
      }
      if (unit.equipment !== 0 && !hasEquipmentCoverage) {
        throw new Error(`Missing canonical equipment coverage for unit ${unit.id}`);
      }

      return [unit.id, {
        ...unit,
        personnel: projection.personnel,
        equipment: projection.equipment,
      }];
    }),
  );

  return { ...state, units };
}

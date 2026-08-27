import { isWorldPosition } from './spatialPosition';
import type { ScenarioState } from './types';

/**
 * Executable guard for DWST's single spatial authority.
 *
 * A unit's physical location is authoritative only at `UnitState.position`.
 * Orders may carry a destination, but that is intent/target data rather than a
 * second current position. UI/map coordinates are intentionally outside this
 * core invariant because they belong to the host map boundary.
 */
export function validateScenarioSpatialIntegrity(state: ScenarioState): string[] {
  const errors: string[] = [];

  for (const [unitId, unit] of Object.entries(state.units)) {
    if (unit.id !== unitId) {
      errors.push(`Unit key '${unitId}' does not match unit.id '${unit.id}'.`);
    }

    if (!isWorldPosition(unit.position)) {
      errors.push(`Unit '${unitId}' has an invalid canonical position.`);
    }

    if (unit.order?.destination && !isWorldPosition(unit.order.destination)) {
      errors.push(`Unit '${unitId}' has an invalid movement destination.`);
    }
  }

  return errors;
}

export function assertScenarioSpatialIntegrity(state: ScenarioState): void {
  const errors = validateScenarioSpatialIntegrity(state);
  if (errors.length > 0) {
    throw new Error(`Scenario spatial integrity failed: ${errors.join(' ')}`);
  }
}

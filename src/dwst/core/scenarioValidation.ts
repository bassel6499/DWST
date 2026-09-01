import { getEraRuleset } from './eraRules';
import { isWorldPosition } from './spatialPosition';
import type { ScenarioState, UnitState } from './types';

const boundedUnitFields: ReadonlyArray<keyof Pick<UnitState,
  'readiness' | 'training' | 'experience' | 'morale' | 'cohesion' |
  'fatigue' | 'wear' | 'logistics' | 'commandQuality' | 'intelligence' |
  'ammunition' | 'fuel'
>> = [
  'readiness', 'training', 'experience', 'morale', 'cohesion',
  'fatigue', 'wear', 'logistics', 'commandQuality', 'intelligence',
  'ammunition', 'fuel',
];

const finiteNonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const validateUnit = (unit: UnitState, knownUnitIds: ReadonlySet<string>): string[] => {
  const errors: string[] = [];
  if (!unit.id.trim()) errors.push('unit id must not be empty');
  if (!unit.name.trim()) errors.push(`unit ${unit.id || '<unknown>'} name must not be empty`);
  if (!finiteNonNegative(unit.personnel)) errors.push(`unit ${unit.id} personnel must be a non-negative finite number`);
  if (!finiteNonNegative(unit.equipment)) errors.push(`unit ${unit.id} equipment must be a non-negative finite number`);
  if (!finiteNonNegative(unit.combatPower)) errors.push(`unit ${unit.id} combatPower must be a non-negative finite number`);
  if (!finiteNonNegative(unit.cumulativeLosses)) errors.push(`unit ${unit.id} cumulativeLosses must be a non-negative finite number`);
  if (!isWorldPosition(unit.position)) errors.push(`unit ${unit.id} position is invalid`);

  for (const field of boundedUnitFields) {
    const value = unit[field];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
      errors.push(`unit ${unit.id} ${field} must be between 0 and 1`);
    }
  }

  if (unit.parentId !== undefined && (!unit.parentId.trim() || !knownUnitIds.has(unit.parentId))) {
    errors.push(`unit ${unit.id} parentId must reference an existing unit`);
  }
  if (unit.parentId === unit.id) errors.push(`unit ${unit.id} cannot parent itself`);
  if (unit.order?.destination && !isWorldPosition(unit.order.destination)) {
    errors.push(`unit ${unit.id} order destination is invalid`);
  }
  return errors;
};

const hasParentCycle = (unit: UnitState, units: Readonly<Record<string, UnitState>>): boolean => {
  const seen = new Set<string>();
  let current: UnitState | undefined = unit;
  while (current?.parentId) {
    if (seen.has(current.id)) return true;
    seen.add(current.id);
    current = units[current.parentId];
  }
  return false;
};

/** Validate scenario data before any simulation resolution begins. */
export function validateScenario(state: ScenarioState): string[] {
  const errors: string[] = [];
  if (!state || typeof state !== 'object') return ['scenario must be an object'];
  if (!state.id?.trim()) errors.push('scenario id must not be empty');
  if (!state.name?.trim()) errors.push('scenario name must not be empty');
  if (!getEraRuleset(state.era)) errors.push(`scenario era is unknown: ${String(state.era)}`);
  if (!Number.isFinite(state.turnHours) || state.turnHours <= 0) errors.push('turnHours must be positive');
  if (!Number.isFinite(state.elapsedHours) || state.elapsedHours < 0) errors.push('elapsedHours must be a non-negative finite number');

  for (const [name, value] of [
    ['weather', state.weather], ['terrain', state.terrain], ['intelLevel', state.intelLevel],
  ] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 1) errors.push(`${name} must be between 0 and 1`);
  }

  const units = state.units;
  if (!units || typeof units !== 'object') {
    errors.push('scenario must contain a units record');
    return errors;
  }
  const unitEntries = Object.entries(units);
  if (unitEntries.length === 0) errors.push('scenario must contain at least one unit');
  const knownUnitIds = new Set(unitEntries.map(([id]) => id));

  for (const [key, unit] of unitEntries) {
    if (!unit || typeof unit !== 'object') {
      errors.push(`unit ${key} is invalid`);
      continue;
    }
    if (key !== unit.id) errors.push(`unit record key ${key} does not match unit.id ${unit.id}`);
    errors.push(...validateUnit(unit, knownUnitIds));
    if (hasParentCycle(unit, units)) errors.push(`unit ${unit.id} has a parent cycle`);
  }

  const locationIds = new Set<string>();
  for (const location of state.locations ?? []) {
    if (!location.id.trim()) errors.push('scenario location id must not be empty');
    if (locationIds.has(location.id)) errors.push(`duplicate scenario location: ${location.id}`);
    locationIds.add(location.id);
    if (!location.name.trim()) errors.push(`scenario location ${location.id} name must not be empty`);
    if (!isWorldPosition(location.position)) errors.push(`scenario location ${location.id} position is invalid`);
  }

  const sensorIds = new Set<string>();
  for (const sensor of state.sensors ?? []) {
    if (!sensor.id.trim()) errors.push('sensor id must not be empty');
    if (sensorIds.has(sensor.id)) errors.push(`duplicate sensor: ${sensor.id}`);
    sensorIds.add(sensor.id);
    if (!knownUnitIds.has(sensor.unitId)) errors.push(`sensor ${sensor.id} references unknown unit ${sensor.unitId}`);
    if (!Number.isFinite(sensor.rangeKm) || sensor.rangeKm <= 0) errors.push(`sensor ${sensor.id} rangeKm must be positive`);
    if (!Number.isFinite(sensor.quality) || sensor.quality < 0 || sensor.quality > 1) errors.push(`sensor ${sensor.id} quality must be between 0 and 1`);
  }

  for (const event of state.events ?? []) {
    if (!Number.isInteger(event.turn) || event.turn < 0) errors.push('scenario event turn must be a non-negative integer');
    for (const unitId of event.unitIds) {
      if (!knownUnitIds.has(unitId)) errors.push(`scenario event references unknown unit ${unitId}`);
    }
  }
  return errors;
}

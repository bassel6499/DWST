import { describe, expect, it } from 'vitest';
import { advanceCanonicalSimulation, startCanonicalSimulation } from './canonicalSimulationSession';
import type { CanonicalState } from './canonicalState';
import type { CombatAllocationPolicy } from './canonicalCombatAllocation';
import { resolveOrderDestination } from './scenarioLocations';
import { parseNaturalLanguageOrder } from './orderProcessor';
import { geographicDistanceMeters } from './geographicMovement';
import { ardennes1944 } from '../scenarios/ardennes1944';

const policy: CombatAllocationPolicy = {
  personnelDisposition: 'killed',
  equipmentDisposition: 'destroyed',
  eligiblePersonnelStatuses: ['assigned'],
  eligibleEquipmentStatuses: ['operational'],
  selection: 'stable-id',
};

const scenario = () => {
  const base = {
    ...ardennes1944,
    units: Object.fromEntries(Object.entries(ardennes1944.units).slice(0, 1)),
    events: [],
  };
  const unit = Object.values(base.units)[0];
  return {
    ...base,
    units: {
      [unit.id]: { ...unit, personnel: 0, equipment: 0, ammunition: 1, fuel: 1 },
    },
  };
};

const canonical = (unitId: string): CanonicalState => ({
  personnel: { personnel: [] },
  equipment: [],
  crewAssignments: [],
  equipmentDefinitions: [],
  consumables: [{ unitId, ammunition: 1, fuel: 1 }],
});

describe('live movement-order integration', () => {
  it('resolves a named objective before the canonical simulation movement step', () => {
    const state = scenario();
    const unit = Object.values(state.units)[0];
    const parsed = parseNaturalLanguageOrder('move toward Bastogne', unit);
    const resolved = resolveOrderDestination(state, parsed.order);
    const bastogne = state.locations?.find((location) => location.name === 'Bastogne');

    expect(parsed.order.objective).toBe('Bastogne');
    expect(bastogne).toBeDefined();
    expect(resolved.destination).toEqual(bastogne!.position);

    const session = startCanonicalSimulation({
      ...state,
      units: {
        [unit.id]: { ...unit, order: resolved },
      },
    }, canonical(unit.id));

    const result = advanceCanonicalSimulation(session, policy);
    const moved = result.session.state.units[unit.id];

    expect(moved.position).not.toEqual(unit.position);
    expect(geographicDistanceMeters(moved.position, resolved.destination!)).toBeLessThan(
      geographicDistanceMeters(unit.position, resolved.destination!),
    );
    expect(result.report.events.some((event) => event.phase === 'movement' && event.unitIds.includes(unit.id))).toBe(true);
  });

  it('does not invent a destination for an unknown objective', () => {
    const state = scenario();
    const unit = Object.values(state.units)[0];
    const parsed = parseNaturalLanguageOrder('move toward NotARealPlace', unit);
    const resolved = resolveOrderDestination(state, parsed.order);

    expect(resolved.destination).toBeUndefined();
  });
});
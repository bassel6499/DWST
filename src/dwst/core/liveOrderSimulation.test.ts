import { describe, expect, it } from 'vitest';
import { advanceCanonicalSimulation, startCanonicalSimulation } from './canonicalSimulationSession';
import type { CanonicalState } from './canonicalState';
import type { CombatAllocationPolicy } from './canonicalCombatAllocation';
import type { ScenarioState } from './types';
import { resolveOrderDestination } from './scenarioLocations';
import { parseNaturalLanguageOrder } from './orderProcessor';
import { geographicDistanceMeters } from './geographicMovement';

const policy: CombatAllocationPolicy = {
  personnelDisposition: 'killed',
  equipmentDisposition: 'destroyed',
  eligiblePersonnelStatuses: ['assigned'],
  eligibleEquipmentStatuses: ['operational'],
  selection: 'stable-id',
};

/**
 * Minimal generic fixture for live-order behavior.
 * This deliberately does not import a historical scenario: the test verifies
 * Core order parsing/resolution/movement, not Ardennes data.
 */
const scenario = (): ScenarioState => {
  const unitId = 'test-unit';
  return {
    id: 'live-order-test',
    name: 'Live order test scenario',
    era: 'ww2',
    scale: 'tactical',
    turnHours: 1,
    elapsedHours: 0,
    weather: 0,
    terrain: 0,
    intelLevel: 1,
    units: {
      [unitId]: {
        id: unitId,
        name: 'Test Unit',
        side: 'allied',
        echelon: 'company',
        personnel: 0,
        equipment: 0,
        ammunition: 1,
        fuel: 1,
        readiness: 1,
        training: 1,
        experience: 1,
        morale: 1,
        cohesion: 1,
        fatigue: 0,
        wear: 0,
        logistics: 1,
        commandQuality: 1,
        intelligence: 1,
        combatPower: 0,
        status: 'operational',
        position: { lon: 5, lat: 50 },
        cumulativeLosses: 0,
        history: [],
      },
    },
    events: [],
    locations: [
      { id: 'test-objective', name: 'Test Objective', position: { lon: 5.1, lat: 50 } },
    ],
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
    const parsed = parseNaturalLanguageOrder('move toward Test Objective', unit);
    const resolved = resolveOrderDestination(state, parsed.order);
    const objective = state.locations?.find((location) => location.name === 'Test Objective');

    expect(parsed.order.objective).toBe('Test Objective');
    expect(objective).toBeDefined();
    expect(resolved.destination).toEqual(objective!.position);

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
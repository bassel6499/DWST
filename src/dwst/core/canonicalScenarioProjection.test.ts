import { describe, expect, it } from 'vitest';
import type { CanonicalState } from './canonicalState';
import { reconcileScenarioResourceAggregates } from './canonicalScenarioProjection';
import type { ScenarioState } from './types';

const scenario: ScenarioState = {
  id: 's1', name: 'test', era: 'ww2', scale: 'tactical', turnHours: 1,
  elapsedHours: 0, weather: 0, terrain: 0, intelLevel: 0,
  units: {
    u1: {
      id: 'u1', name: 'Unit 1', side: 'allied', echelon: 'company',
      personnel: 99, equipment: 88, ammunition: 10, fuel: 10,
      readiness: 0.8, training: 0.7, experience: 0.6, morale: 0.7, cohesion: 0.8,
      fatigue: 0.1, wear: 0.1, logistics: 0.9, commandQuality: 0.8, intelligence: 0.5,
      combatPower: 10, status: 'operational', position: { latitude: 1, longitude: 2 },
      cumulativeLosses: 0, history: [],
    },
  },
  events: [],
};

const canonical: CanonicalState = {
  personnel: {
    personnel: [
      { id: 'p2', unitId: 'u1', status: 'assigned', qualifications: [], experience: {} },
      { id: 'p1', unitId: 'u1', status: 'wounded', qualifications: [], experience: {} },
    ],
  },
  equipment: [
    { instanceId: 'e1', definitionId: 'eq', unitId: 'u1', status: 'operational' },
    { instanceId: 'e2', definitionId: 'eq', unitId: 'u1', status: 'destroyed' },
  ],
  crewAssignments: [],
  equipmentDefinitions: [],
};

describe('canonical scenario resource projection', () => {
  it('reconciles personnel and equipment aggregates from canonical records', () => {
    const next = reconcileScenarioResourceAggregates(scenario, canonical);
    expect(next.units.u1.personnel).toBe(2);
    expect(next.units.u1.equipment).toBe(2);
    expect(next.units.u1.readiness).toBe(scenario.units.u1.readiness);
    expect(next.units.u1.position).toEqual(scenario.units.u1.position);
    expect(scenario.units.u1.personnel).toBe(99);
  });

  it('rejects silent zeroing when a non-zero aggregate has no canonical ownership coverage', () => {
    const emptyCanonical: CanonicalState = {
      personnel: { personnel: [] }, equipment: [], crewAssignments: [], equipmentDefinitions: [],
    };
    expect(() => reconcileScenarioResourceAggregates(scenario, emptyCanonical))
      .toThrow('Missing canonical personnel coverage for unit u1');
  });

  it('allows an intentionally empty canonical resource set for a zero aggregate', () => {
    const zeroScenario: ScenarioState = {
      ...scenario,
      units: { u1: { ...scenario.units.u1, personnel: 0, equipment: 0 } },
    };
    const next = reconcileScenarioResourceAggregates(zeroScenario, {
      personnel: { personnel: [] }, equipment: [], crewAssignments: [], equipmentDefinitions: [],
    });
    expect(next.units.u1.personnel).toBe(0);
    expect(next.units.u1.equipment).toBe(0);
  });
});

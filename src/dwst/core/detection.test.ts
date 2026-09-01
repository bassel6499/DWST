import { describe, expect, it } from 'vitest';
import { detectContacts } from './detection';
import { DEFAULT_DETECTION_POLICY } from './eraRules';
import type { ScenarioState, UnitState } from './types';

function unit(id: string, side: UnitState['side'], lon: number, lat: number): UnitState {
  return {
    id,
    name: id,
    side,
    echelon: 'company',
    personnel: 100,
    equipment: 10,
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
    combatPower: 100,
    status: 'operational',
    position: { lon, lat },
    cumulativeLosses: 0,
    history: [],
  };
}

function state(units: UnitState[]): ScenarioState {
  return {
    id: 'detection-test',
    name: 'detection test',
    era: 'contemporary',
    scale: 'tactical',
    turnHours: 1,
    elapsedHours: 0,
    weather: 1,
    terrain: 1,
    intelLevel: 1,
    units: Object.fromEntries(units.map((u) => [u.id, u])),
    events: [],
  };
}

describe('canonical geographic detection', () => {
  it('uses geodesic distance for an equatorial one-degree separation', () => {
    const contacts = detectContacts(state([
      unit('observer', 'allied', 0, 0),
      unit('target', 'enemy', 1, 0),
    ]));

    expect(contacts).toHaveLength(2);
    const forward = contacts.find((c) => c.observerId === 'observer');
    expect(forward?.distanceKm).toBeGreaterThan(111);
    expect(forward?.distanceKm).toBeLessThan(112);
  });

  it('takes the short geographic route across the antimeridian', () => {
    const contacts = detectContacts(state([
      unit('west', 'allied', 179, 0),
      unit('east', 'enemy', -179, 0),
    ]));

    const forward = contacts.find((c) => c.observerId === 'west');
    expect(forward?.distanceKm).toBeGreaterThan(220);
    expect(forward?.distanceKm).toBeLessThan(230);
  });

  it('does not produce same-side contacts', () => {
    expect(detectContacts(state([
      unit('a', 'allied', 35.5, 33.9),
      unit('b', 'allied', 35.6, 33.9),
    ]))).toEqual([]);
  });

  it('keeps the contact pipeline generic while allowing era-owned range policy', () => {
    const scenario = state([
      unit('observer', 'allied', 0, 0),
      unit('target', 'enemy', 0.1, 0),
    ]);
    const shortRangePolicy = {
      ...DEFAULT_DETECTION_POLICY,
      baseUnaidedRangeKm: 1,
      sensorRangeModifiers: { ...DEFAULT_DETECTION_POLICY.sensorRangeModifiers },
    };

    const defaultContact = detectContacts(scenario).find((c) => c.observerId === 'observer');
    const shortRangeContact = detectContacts(scenario, [], shortRangePolicy).find((c) => c.observerId === 'observer');

    expect(defaultContact?.detected).toBe(true);
    expect(shortRangeContact?.detected).toBe(false);
    expect(defaultContact?.distanceKm).toBeCloseTo(shortRangeContact?.distanceKm ?? 0, 9);
  });
});

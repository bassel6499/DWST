import { describe, expect, it } from 'vitest';
import type { CanonicalState } from './canonicalState';
import { createReplayProvenance } from './replayProvenance';
import { getEraRuleset } from './eraRules';
import type { ScenarioState } from './types';
import {
  DWST_SERIALIZATION_VERSION,
  deserializeCanonicalState,
  deserializeReplayProvenance,
  deserializeScenarioState,
  serializeCanonicalState,
  serializeReplayProvenance,
  serializeScenarioState,
} from './serialization';

const scenario: ScenarioState = {
  id: 'b15-fixture',
  name: 'B15 serialization fixture',
  era: 'ww2',
  scale: 'tactical',
  turnHours: 6,
  elapsedHours: 12,
  weather: 0.2,
  terrain: 0.7,
  intelLevel: 0.8,
  units: {
    blue: {
      id: 'blue', name: 'Blue', side: 'allied', echelon: 'company',
      personnel: 90, equipment: 8, ammunition: 0.75, fuel: 0.6,
      readiness: 0.9, training: 0.8, experience: 0.7, morale: 0.85, cohesion: 0.8,
      fatigue: 0.1, wear: 0.05, logistics: 0.9, commandQuality: 0.8, intelligence: 0.7,
      combatPower: 0.85, status: 'operational', position: { lat: 49.8, lon: 6.1 },
      order: { type: 'move', destination: { lat: 49.9, lon: 6.2 }, priority: 'high' },
      cumulativeLosses: 3,
      history: [{ turn: 1, type: 'combat', summary: 'Lost personnel', personnelLosses: 3 }],
    },
  },
  events: [{ turn: 1, phase: 'combat', message: 'Blue engaged', unitIds: ['blue'] }],
  locations: [{ id: 'obj', name: 'Objective', position: { lat: 50, lon: 6.3 } }],
  sensors: [{ id: 'sensor-1', unitId: 'blue', type: 'recon', rangeKm: 25, quality: 0.9 }],
};

const canonical: CanonicalState = {
  personnel: {
    personnel: [{
      id: 'p1', unitId: 'blue', status: 'assigned', qualifications: ['rifle'],
      experience: { trained: 1 },
    }],
  },
  equipment: [],
  crewAssignments: [],
  equipmentDefinitions: [],
  consumables: [{ unitId: 'blue', ammunition: 0.75, fuel: 0.6 }],
};

describe('B15 serialization', () => {
  it('round-trips scenario state without semantic loss', () => {
    const restored = deserializeScenarioState(serializeScenarioState(scenario));
    expect(restored).toEqual(scenario);
    expect(restored).not.toBe(scenario);
  });

  it('round-trips canonical resource state, including consumables and nested personnel data', () => {
    const restored = deserializeCanonicalState(serializeCanonicalState(canonical));
    expect(restored).toEqual(canonical);
    expect(restored).not.toBe(canonical);
  });

  it('round-trips replay provenance and its command journal', () => {
    const rules = getEraRuleset('ww2');
    if (!rules) throw new Error('WW2 ruleset fixture is unavailable');
    const provenance = createReplayProvenance(rules, [{
      sequence: 0, turn: 1, unitId: 'blue', order: { type: 'move', priority: 'high' },
    }]);
    const restored = deserializeReplayProvenance(serializeReplayProvenance(provenance));
    expect(restored).toEqual(provenance);
    expect(restored.commands).toHaveLength(1);
    expect(restored.rulesetContentHash).toBe(provenance.rulesetContentHash);
  });

  it('uses an explicit versioned envelope and rejects incompatible envelopes', () => {
    const encoded = serializeScenarioState(scenario);
    const envelope = JSON.parse(encoded);
    expect(envelope).toMatchObject({ format: 'dwst', version: DWST_SERIALIZATION_VERSION, kind: 'scenario-state' });
    expect(() => deserializeScenarioState(JSON.stringify({ ...envelope, version: 999 }))).toThrow(/version/);
    expect(() => deserializeScenarioState(JSON.stringify({ ...envelope, kind: 'canonical-state' }))).toThrow(/kind/);
    expect(() => deserializeScenarioState('{not-json}')).toThrow(/JSON/);
  });

  it('rejects non-finite numbers instead of allowing JSON to turn them into null', () => {
    const invalid = { ...scenario, elapsedHours: Number.NaN };
    expect(() => serializeScenarioState(invalid)).toThrow(/non-finite/);
  });
});

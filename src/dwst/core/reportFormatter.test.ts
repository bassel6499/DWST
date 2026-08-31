import { describe, expect, it } from 'vitest';
import { formatSimulationReport } from './reportFormatter';
import { resolveTurn } from './engine';
import { getEraRuleset } from './eraRules';
import type { ScenarioState, SimulationReport, UnitState } from './types';

const report: SimulationReport = {
  turn: 3,
  elapsedHours: 12,
  events: [
    { turn: 3, phase: 'combat', message: 'Bravo engaged Alpha', unitIds: ['b', 'a'] },
    { turn: 3, phase: 'movement', message: 'Charlie moved', unitIds: ['c'] },
  ],
  units: [
    {
      id: 'b', name: 'Bravo', side: 'enemy', echelon: 'company', personnel: 90, equipment: 8,
      ammunition: 40, fuel: 60, readiness: 1, training: 1, experience: 1, morale: 1,
      cohesion: 1, fatigue: 0, wear: 0, logistics: 1, commandQuality: 1, intelligence: 1,
      combatPower: 10, status: 'operational', position: { lat: 2, lon: 2 }, cumulativeLosses: 10, history: [],
    },
    {
      id: 'a', name: 'Alpha', side: 'allied', echelon: 'company', personnel: 100, equipment: 10,
      ammunition: 50, fuel: 70, readiness: 1, training: 1, experience: 1, morale: 1,
      cohesion: 1, fatigue: 0, wear: 0, logistics: 1, commandQuality: 1, intelligence: 1,
      combatPower: 12, status: 'operational', position: { lat: 1, lon: 1 }, cumulativeLosses: 0, history: [],
    },
  ],
  resourceDeltas: [
    { unitId: 'b', personnel: -10, equipment: -2, ammunition: -4, fuel: 0 },
    { unitId: 'a', personnel: 0, equipment: 0, ammunition: -3, fuel: -1 },
  ],
};

const makeUnit = (id: string, side: 'allied' | 'enemy'): UnitState => ({
  id,
  name: id.toUpperCase(),
  side,
  echelon: 'company',
  personnel: 100,
  equipment: 10,
  ammunition: 50,
  fuel: 70,
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
  combatPower: 12,
  status: 'operational',
  position: { lat: id === 'a' ? 1 : 2, lon: id === 'a' ? 1 : 2 },
  cumulativeLosses: 0,
  history: [],
});

const makeScenario = (units: Record<string, UnitState>): ScenarioState => ({
  id: 'determinism-test',
  name: 'Determinism Test',
  era: 'ww2',
  scale: 'tactical',
  turnHours: 6,
  elapsedHours: 0,
  weather: 0,
  terrain: 0,
  intelLevel: 1,
  units,
  events: [],
  sensors: [],
});

describe('formatSimulationReport', () => {
  it('renders a deterministic plain-text report', () => {
    const first = formatSimulationReport(report);
    const reordered = formatSimulationReport({
      ...report,
      events: [...report.events].reverse(),
      units: [...report.units].reverse(),
      resourceDeltas: [...report.resourceDeltas].reverse(),
    });

    expect(first).toBe(reordered);
    expect(first).toContain('Turn 3');
    expect(first).toContain('Elapsed hours: 12');
    expect(first).toContain('personnel=-10, equipment=-2, ammunition=-4, fuel=0');
  });

  it('produces the same machine-readable report regardless of unit insertion order', () => {
    const rules = getEraRuleset('ww2');
    const first = resolveTurn(makeScenario({ a: makeUnit('a', 'allied'), b: makeUnit('b', 'enemy') }), rules);
    const reordered = resolveTurn(makeScenario({ b: makeUnit('b', 'enemy'), a: makeUnit('a', 'allied') }), rules);

    expect(reordered).toEqual(first);
    expect(formatSimulationReport(reordered)).toBe(formatSimulationReport(first));
  });
});

import { describe, expect, it } from 'vitest';
import { advanceSimulation, startSimulation } from './simulationSession';
import { resolveOrderDestination } from './scenarioLocations';
import { parseNaturalLanguageOrder } from './orderProcessor';
import { ardennes1944 } from '../scenarios/ardennes1944';

const scenario = () => ({
  ...ardennes1944,
  units: Object.fromEntries(Object.entries(ardennes1944.units).slice(0, 1)),
  events: [],
});

describe('live movement-order integration', () => {
  it('resolves a named objective before the canonical simulation movement step', () => {
    const state = scenario();
    const unit = Object.values(state.units)[0];
    const parsed = parseNaturalLanguageOrder('move toward Bastogne', unit);
    const resolved = resolveOrderDestination(state, parsed.order);

    expect(parsed.order.objective).toBe('Bastogne');
    expect(resolved.destination).toEqual(ardennes1944.locations[0].position);

    const session = startSimulation({
      ...state,
      units: {
        [unit.id]: { ...unit, order: resolved },
      },
    });

    const result = advanceSimulation(session);
    const moved = result.session.state.units[unit.id];

    expect(moved.position).not.toEqual(unit.position);
    expect(moved.position.lat).toBeGreaterThan(unit.position.lat);
    expect(moved.position.lat).toBeLessThan(resolved.destination!.lat);
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

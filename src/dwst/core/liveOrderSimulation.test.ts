import { describe, expect, it } from 'vitest';
import { advanceSimulation, startSimulation } from './simulationSession';
import { resolveOrderDestination } from './scenarioLocations';
import { parseNaturalLanguageOrder } from './orderProcessor';
import { geographicDistanceMeters } from './geographicMovement';
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
    const bastogne = state.locations?.[0];

    expect(parsed.order.objective).toBe('Bastogne');
    expect(bastogne).toBeDefined();
    expect(resolved.destination).toEqual(bastogne!.position);

    const session = startSimulation({
      ...state,
      units: {
        [unit.id]: { ...unit, order: resolved },
      },
    });

    const result = advanceSimulation(session);
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

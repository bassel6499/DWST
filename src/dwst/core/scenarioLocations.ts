import type { Order, ScenarioLocation, ScenarioState } from './types';

const normalize = (value: string): string => value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Resolve a named scenario objective against scenario-owned geographic data. */
export function resolveScenarioLocation(state: ScenarioState, objective?: string): ScenarioLocation | undefined {
  if (!objective || !state.locations?.length) return undefined;
  const target = normalize(objective);
  if (!target) return undefined;
  return state.locations.find((location) => normalize(location.name) === target || normalize(location.id) === target);
}

/** Resolve an order's named objective without making the parser or map layer geographic authorities. */
export function resolveOrderDestination(state: ScenarioState, order: Order): Order {
  if (order.destination || !order.objective) return order;
  const location = resolveScenarioLocation(state, order.objective);
  return location ? { ...order, destination: { ...location.position } } : order;
}

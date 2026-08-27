import type { ScenarioState, UnitState } from './types';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const distanceKm = (a: UnitState['position'], b: UnitState['position']) => {
  const latKm = (b.lat - a.lat) * 111;
  const lonKm = (b.lon - a.lon) * 111 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot(latKm, lonKm);
};

export function resolveMovement(state: ScenarioState): void {
  const hours = state.turnHours;
  for (const unit of Object.values(state.units)) {
    const order = unit.order;
    if (!order?.destination || unit.status === 'destroyed' || unit.status === 'withdrawn') continue;

    const maxKm = 2.5 * hours *
      (0.55 + 0.45 * clamp(unit.readiness)) *
      (1 - 0.45 * clamp(unit.fatigue)) *
      (0.65 + 0.35 * clamp(unit.logistics)) *
      (0.7 + 0.3 * clamp(state.weather));

    const remaining = distanceKm(unit.position, order.destination);
    if (remaining <= 0.05) continue;
    const fraction = Math.min(1, maxKm / remaining);
    unit.position = {
      lon: unit.position.lon + (order.destination.lon - unit.position.lon) * fraction,
      lat: unit.position.lat + (order.destination.lat - unit.position.lat) * fraction,
    };
    unit.fatigue = clamp(unit.fatigue + 0.02 * fraction);
    unit.fuel = clamp(unit.fuel - 0.025 * fraction);
    unit.logistics = clamp(unit.logistics - 0.015 * fraction);
  }
}

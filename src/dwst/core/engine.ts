import type { Order, ScenarioState, SimulationEvent, SimulationReport, UnitState } from './types';
import { getEraRuleset, type EngineCoefficients, type EraRuleset } from './eraRules';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/**
 * Deterministic engine orchestration. Era-dependent coefficients are supplied
 * by the selected ruleset; the engine remains unaware of historical eras.
 */
export function effectiveReadiness(unit: UnitState): number {
  return clamp(
    unit.readiness *
      (0.6 + 0.4 * unit.logistics) *
      (1 - 0.35 * unit.fatigue) *
      (1 - 0.25 * unit.wear),
  );
}

export function effectiveCombatPower(unit: UnitState): number {
  return Math.max(
    0,
    unit.combatPower *
      effectiveReadiness(unit) *
      (0.75 + 0.25 * unit.training) *
      (0.75 + 0.25 * unit.experience) *
      (0.75 + 0.25 * unit.cohesion) *
      (0.75 + 0.25 * unit.morale) *
      (0.8 + 0.2 * unit.commandQuality),
  );
}

export function applyOrder(unit: UnitState, order: Order): UnitState {
  return { ...unit, order };
}

function resolveMovement(unit: UnitState, hours: number, rules:EngineCoefficients): SimulationEvent | undefined {
  if (!unit.order?.destination || unit.status === 'destroyed') return undefined;

  const distanceFactor = Math.min(1, hours / rules.movementHours);
  const readiness = effectiveReadiness(unit);
  const completion = distanceFactor * (1 - rules.movementReadinessWeight + rules.movementReadinessWeight * readiness) * (1 - rules.movementCommandWeight + rules.movementCommandWeight * unit.commandQuality);

  const dx = unit.order.destination.lon - unit.position.lon;
  const dy = unit.order.destination.lat - unit.position.lat;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return undefined;

  const ratio = Math.min(1, completion);
  unit.position = {
    lon: unit.position.lon + dx * ratio,
    lat: unit.position.lat + dy * ratio,
  };
  unit.fatigue = clamp(unit.fatigue + rules.movementFatigue * distanceFactor);
  unit.wear = clamp(unit.wear + rules.movementWear * distanceFactor);
  unit.fuel = clamp(unit.fuel - rules.movementFuel * distanceFactor);

  return {
    turn: 0,
    phase: 'movement',
    message: `${unit.name} executed its movement order at ${(completion * 100).toFixed(0)}% expected efficiency.`,
    unitIds: [unit.id],
  };
}

export function resolveTurn(state: ScenarioState, rules:EraRuleset=getEraRuleset(state.era)): SimulationReport {
  const errors=rules ? [] : ['No ruleset selected'];
  if(errors.length) throw new Error(errors[0]);
  const events: SimulationEvent[] = [];
  const hours = state.turnHours;
  const turn = Math.floor(state.elapsedHours / Math.max(hours, 1)) + 1;

  const units = Object.values(state.units).map((unit) => {
    const next = { ...unit, history: [...unit.history] };
    const event = resolveMovement(next, hours, rules.engine);
    if (event) events.push({ ...event, turn });

    next.fatigue = clamp(next.fatigue + rules.engine.turnFatigue * (hours / rules.engine.movementHours));
    if(rules.logisticsEnabled) next.logistics = clamp(next.logistics - rules.engine.logisticsDrain * (hours / rules.engine.movementHours));
    next.readiness = clamp(next.readiness - rules.engine.readinessDrain * (hours / rules.engine.movementHours));

    next.combatPower = effectiveCombatPower(next);
    return next;
  });

  state.elapsedHours += hours;
  state.units = Object.fromEntries(units.map((unit) => [unit.id, unit]));
  state.events.push(...events);

  return { turn, elapsedHours: state.elapsedHours, events, units };
}

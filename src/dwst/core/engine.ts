import type { Order, ScenarioState, SimulationEvent, SimulationReport, UnitState } from './types';
import { getEraRuleset, type EngineCoefficients, type EraRuleset } from './eraRules';
import { assessUnit } from './unitAssessment';
import type { SimulationBaseline } from './simulationBaseline';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const DEFAULT_COEFFICIENTS: EngineCoefficients = {
  movementHours: 6, movementReadinessWeight: 0.65, movementCommandWeight: 0.3, movementFatigue: 0.04, movementWear: 0.02, movementFuel: 0.04,
  turnFatigue: 0.01, logisticsDrain: 0.015, readinessDrain: 0.005, readinessLogisticsWeight: 0.4, readinessFatiguePenalty: 0.35, readinessWearPenalty: 0.25,
  trainingEffect: 0.25, experienceEffect: 0.25, cohesionEffect: 0.25, moraleEffect: 0.25, commandEffect: 0.2,
};

/** Deterministic engine orchestration. Historical behavior belongs in rulesets. */
export function effectiveReadiness(unit: UnitState, coefficients: EngineCoefficients = DEFAULT_COEFFICIENTS): number {
  return clamp(unit.readiness *
    (1 - coefficients.readinessLogisticsWeight + coefficients.readinessLogisticsWeight * unit.logistics) *
    (1 - coefficients.readinessFatiguePenalty * unit.fatigue) *
    (1 - coefficients.readinessWearPenalty * unit.wear));
}

export function effectiveCombatPower(unit: UnitState, coefficients: EngineCoefficients = DEFAULT_COEFFICIENTS): number {
  return Math.max(0, unit.combatPower * effectiveReadiness(unit, coefficients) *
    (1 - coefficients.trainingEffect + coefficients.trainingEffect * unit.training) *
    (1 - coefficients.experienceEffect + coefficients.experienceEffect * unit.experience) *
    (1 - coefficients.cohesionEffect + coefficients.cohesionEffect * unit.cohesion) *
    (1 - coefficients.moraleEffect + coefficients.moraleEffect * unit.morale) *
    (1 - coefficients.commandEffect + coefficients.commandEffect * unit.commandQuality));
}

export function applyOrder(unit: UnitState, order: Order): UnitState { return { ...unit, order }; }

function resolveMovement(unit: UnitState, hours: number, rules: EngineCoefficients): SimulationEvent | undefined {
  if (!unit.order?.destination || unit.status === 'destroyed') return undefined;
  const distanceFactor = Math.min(1, hours / rules.movementHours);
  const readiness = effectiveReadiness(unit, rules);
  const completion = distanceFactor * (1 - rules.movementReadinessWeight + rules.movementReadinessWeight * readiness) * (1 - rules.movementCommandWeight + rules.movementCommandWeight * unit.commandQuality);
  const dx = unit.order.destination.lon - unit.position.lon;
  const dy = unit.order.destination.lat - unit.position.lat;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return undefined;
  const ratio = Math.min(1, completion);
  unit.position = { lon: unit.position.lon + dx * ratio, lat: unit.position.lat + dy * ratio };
  unit.fatigue = clamp(unit.fatigue + rules.movementFatigue * distanceFactor);
  unit.wear = clamp(unit.wear + rules.movementWear * distanceFactor);
  unit.fuel = clamp(unit.fuel - rules.movementFuel * distanceFactor);
  return { turn: 0, phase: 'movement', message: `${unit.name} executed its movement order at ${(completion * 100).toFixed(0)}% expected efficiency.`, unitIds: [unit.id] };
}

/** Pure turn resolution. The supplied ScenarioState is never mutated. */
export function resolveTurn(state: ScenarioState, rules: EraRuleset = getEraRuleset(state.era), baseline?: SimulationBaseline): SimulationReport {
  if (!rules) throw new Error('No ruleset selected');
  const events: SimulationEvent[] = [];
  const hours = state.turnHours;
  const turn = Math.floor(state.elapsedHours / Math.max(hours, 1)) + 1;
  const units = Object.values(state.units).map((unit) => {
    const next = { ...unit, position: { ...unit.position }, history: [...unit.history] };
    const event = resolveMovement(next, hours, rules.engine);
    if (event) events.push({ ...event, turn });
    const scale = hours / rules.engine.movementHours;
    next.fatigue = clamp(next.fatigue + rules.engine.turnFatigue * scale);
    if (rules.logisticsEnabled) next.logistics = clamp(next.logistics - rules.engine.logisticsDrain * scale);
    next.readiness = clamp(next.readiness - rules.engine.readinessDrain * scale);
    next.combatPower = effectiveCombatPower(next, rules.engine);
    if (baseline) next.status = assessUnit(next, baseline, rules.unitAssessment).status;
    return next;
  });
  return { turn, elapsedHours: state.elapsedHours + hours, events, units };
}

/** Explicit state application for callers that want to advance a live scenario. */
export function applyTurn(state: ScenarioState, report: SimulationReport): ScenarioState {
  return {
    ...state,
    elapsedHours: report.elapsedHours,
    units: Object.fromEntries(report.units.map((unit) => [unit.id, unit])),
    events: [...state.events, ...report.events],
  };
}
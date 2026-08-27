import type { Order, ScenarioState, SimulationEvent, SimulationReport, UnitState } from './types';
import { DEFAULT_ENGINE, getEraRuleset, type EngineCoefficients, type EraRuleset } from './eraRules';
import { assessUnit } from './unitAssessment';
import type { SimulationBaseline } from './simulationBaseline';
import { resolveEngagements } from './combat';
import { applyCombatResult } from './combatState';
import { geographicDistanceMeters, interpolateGeographicPosition } from './geographicMovement';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Deterministic engine orchestration. Historical behavior belongs in rulesets. */
export function effectiveReadiness(unit: UnitState, coefficients: EngineCoefficients = DEFAULT_ENGINE): number {
  return clamp(unit.readiness *
    (1 - coefficients.readinessLogisticsWeight + coefficients.readinessLogisticsWeight * unit.logistics) *
    (1 - coefficients.readinessFatiguePenalty * unit.fatigue) *
    (1 - coefficients.readinessWearPenalty * unit.wear));
}

export function effectiveCombatPower(unit: UnitState, coefficients: EngineCoefficients = DEFAULT_ENGINE): number {
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
  const distance = geographicDistanceMeters(unit.position, unit.order.destination);
  if (distance < 1e-6) return undefined;
  const ratio = Math.min(1, completion);
  unit.position = interpolateGeographicPosition(unit.position, unit.order.destination, ratio);
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

  const resolvedState: ScenarioState = { ...state, units: Object.fromEntries(units.map((unit) => [unit.id, unit])) };
  const engagements = rules.resolveCombat ? resolveEngagements(resolvedState) : [];

  for (const engagement of engagements) {
    const attacker = resolvedState.units[engagement.attackerId];
    const defender = resolvedState.units[engagement.defenderId];
    if (!attacker || !defender) continue;

    const applied = applyCombatResult(attacker, defender, engagement);
    resolvedState.units[attacker.id] = applied.attacker;
    resolvedState.units[defender.id] = applied.defender;
    events.push({
      turn,
      phase: 'combat',
      message: engagement.result,
      unitIds: [attacker.id, defender.id],
    });
  }

  const finalUnits = Object.values(resolvedState.units);
  return { turn, elapsedHours: state.elapsedHours + hours, events, units: finalUnits };
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

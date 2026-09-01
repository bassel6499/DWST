import { geographicDistanceMeters } from './geographicMovement';
import { DEFAULT_DETECTION_POLICY, type DetectionPolicy } from './eraRules';
import type { ScenarioState, UnitState, Sensor } from './types';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const km = (a: UnitState['position'], b: UnitState['position']) => geographicDistanceMeters(a, b) / 1000;
export type { Sensor } from './types';
export type { SensorType } from './types';
export interface Contact { observerId: string; targetId: string; distanceKm: number; probability: number; detected: boolean; confidence: 'unknown' | 'unit' | 'formation'; }
export interface DetectionState { contacts: Record<string, Contact[]>; }

/** Canonical detection over ScenarioState and geographic WorldPosition. */
export function detectContacts(
  state: ScenarioState,
  sensors: Sensor[] = [],
  policy: DetectionPolicy = DEFAULT_DETECTION_POLICY,
): Contact[] {
  const out: Contact[] = [];
  const units = Object.values(state.units).filter((u) => u.status !== 'destroyed');

  for (const a of units) {
    for (const b of units) {
      if (a.side === b.side || a.id === b.id) continue;

      const d = km(a.position, b.position);
      const matching = sensors.filter((s) => s.unitId === a.id);
      const sensorBoost = matching.length
        ? Math.max(...matching.map((s) => s.rangeKm * policy.sensorRangeModifiers[s.type] * clamp(s.quality)))
        : policy.baseUnaidedRangeKm;
      const range = sensorBoost
        * (policy.intelligenceFloor + policy.intelligenceWeight * clamp(a.intelligence))
        * (policy.readinessFloor + policy.readinessWeight * clamp(a.readiness))
        * (policy.weatherFloor + policy.weatherWeight * clamp(state.weather));
      const probability = clamp(
        (range * (policy.terrainFloor + policy.terrainWeight * clamp(state.terrain))) / Math.max(d, 0.1),
      );

      out.push({
        observerId: a.id,
        targetId: b.id,
        distanceKm: d,
        probability,
        detected: probability >= 1,
        confidence: probability > policy.formationConfidenceThreshold
          ? 'formation'
          : probability > policy.unitConfidenceThreshold
            ? 'unit'
            : 'unknown',
      });
    }
  }

  return out;
}
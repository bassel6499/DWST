import type { ScenarioState, UnitState } from '../core/types';

const unit = (data: Omit<UnitState, 'cumulativeLosses' | 'history' | 'status'>): UnitState => ({
  ...data,
  status: 'operational',
  cumulativeLosses: 0,
  history: [],
});

/** Prototype scenario shell. Historical ORBAT strengths/locations must be
 * validated against dedicated historical sources before being labelled exact.
 */
export const ardennes1944: ScenarioState = {
  id: 'ardenne-1944-prototype',
  name: 'Ardennes 1944 — DWST Prototype',
  era: 'ww2',
  scale: 'operational',
  turnHours: 6,
  elapsedHours: 0,
  weather: 0.8,
  terrain: 0.9,
  intelLevel: 0.55,
  units: {
    'g-5pa': unit({ id: 'g-5pa', name: 'German 5th Panzer Army', side: 'enemy', echelon: 'army', personnel: 120000, equipment: 1800, ammunition: 0.82, fuel: 0.70, readiness: 0.82, training: 0.78, experience: 0.82, morale: 0.82, cohesion: 0.80, fatigue: 0.12, wear: 0.08, logistics: 0.72, commandQuality: 0.84, intelligence: 0.62, combatPower: 1, position: { lon: 6.5, lat: 50.25 } }),
    'a-1a': unit({ id: 'a-1a', name: 'US 1st Army', side: 'allied', echelon: 'army', personnel: 200000, equipment: 2500, ammunition: 0.86, fuel: 0.88, readiness: 0.78, training: 0.82, experience: 0.80, morale: 0.84, cohesion: 0.82, fatigue: 0.10, wear: 0.07, logistics: 0.88, commandQuality: 0.82, intelligence: 0.70, combatPower: 1, position: { lon: 6.0, lat: 50.1 } }),
  },
  events: [],
};

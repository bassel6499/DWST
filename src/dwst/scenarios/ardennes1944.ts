import type { ScenarioState, UnitState } from '../core/types';

const unit = (data: Omit<UnitState, 'history' | 'cumulativeLosses' | 'status'>): UnitState => ({
  ...data,
  status: 'operational',
  cumulativeLosses: 0,
  history: [],
});

/**
 * Ardennes 1944 starter scenario.
 * Initial data is intentionally a compact prototype roster; historical ORBAT
 * expansion should live in scenario data rather than in simulation code.
 */
export const ardennes1944: ScenarioState = {
  id: 'ww2-ardennes-1944',
  name: 'Ardennes 1944 — Operational Prototype',
  era: 'ww2',
  scale: 'operational',
  turnHours: 6,
  elapsedHours: 0,
  weather: 0.8,
  terrain: 0.85,
  intelLevel: 0.55,
  units: {
    'g-5pa': unit({ id: 'g-5pa', name: '5th Panzer Army', side: 'enemy', echelon: 'army', personnel: 180000, equipment: 1800, ammunition: 0.82, fuel: 0.72, readiness: 0.82, training: 0.78, experience: 0.80, morale: 0.78, cohesion: 0.82, fatigue: 0.12, wear: 0.18, logistics: 0.70, commandQuality: 0.82, intelligence: 0.58, combatPower: 0, position: { lon: 6.10, lat: 50.20 } }),
    'g-2pd': unit({ id: 'g-2pd', name: '2nd Panzer Division', side: 'enemy', parentId: 'g-5pa', echelon: 'division', personnel: 17000, equipment: 120, ammunition: 0.85, fuel: 0.78, readiness: 0.86, training: 0.82, experience: 0.84, morale: 0.82, cohesion: 0.86, fatigue: 0.10, wear: 0.16, logistics: 0.76, commandQuality: 0.84, intelligence: 0.60, combatPower: 0, position: { lon: 6.08, lat: 50.15 } }),
    'g-pl': unit({ id: 'g-pl', name: 'Panzer Lehr Division', side: 'enemy', parentId: 'g-5pa', echelon: 'division', personnel: 15000, equipment: 140, ammunition: 0.84, fuel: 0.74, readiness: 0.84, training: 0.90, experience: 0.88, morale: 0.80, cohesion: 0.88, fatigue: 0.10, wear: 0.18, logistics: 0.72, commandQuality: 0.86, intelligence: 0.62, combatPower: 0, position: { lon: 6.20, lat: 50.05 } }),
    'g-26vgd': unit({ id: 'g-26vgd', name: '26th Volksgrenadier Division', side: 'enemy', parentId: 'g-5pa', echelon: 'division', personnel: 11000, equipment: 35, ammunition: 0.68, fuel: 0.60, readiness: 0.68, training: 0.55, experience: 0.50, morale: 0.62, cohesion: 0.64, fatigue: 0.16, wear: 0.24, logistics: 0.60, commandQuality: 0.62, intelligence: 0.48, combatPower: 0, position: { lon: 5.95, lat: 50.00 } }),
    'a-101ab': unit({ id: 'a-101ab', name: '101st Airborne Division', side: 'allied', echelon: 'division', personnel: 16000, equipment: 60, ammunition: 0.82, fuel: 0.78, readiness: 0.88, training: 0.86, experience: 0.82, morale: 0.90, cohesion: 0.90, fatigue: 0.08, wear: 0.12, logistics: 0.82, commandQuality: 0.88, intelligence: 0.72, combatPower: 0, position: { lon: 5.72, lat: 50.00 } }),
    'a-7ad': unit({ id: 'a-7ad', name: '7th Armored Division', side: 'allied', echelon: 'division', personnel: 14000, equipment: 220, ammunition: 0.78, fuel: 0.76, readiness: 0.84, training: 0.82, experience: 0.80, morale: 0.82, cohesion: 0.84, fatigue: 0.10, wear: 0.14, logistics: 0.78, commandQuality: 0.82, intelligence: 0.68, combatPower: 0, position: { lon: 5.90, lat: 50.10 } }),
    'a-10ad': unit({ id: 'a-10ad', name: '10th Armored Division', side: 'allied', echelon: 'division', personnel: 15000, equipment: 230, ammunition: 0.80, fuel: 0.74, readiness: 0.82, training: 0.80, experience: 0.78, morale: 0.80, cohesion: 0.82, fatigue: 0.11, wear: 0.15, logistics: 0.76, commandQuality: 0.80, intelligence: 0.66, combatPower: 0, position: { lon: 5.55, lat: 49.95 } }),
  },
  events: [],
};

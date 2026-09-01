import type { ScenarioState, UnitState } from '../core/types';
import { reconcileScenarioResourceAggregates } from '../core/canonicalScenarioProjection';
import { ardennes1944Canonical } from './ardennes1944Canonical';

const unit = (data: Omit<UnitState, 'history' | 'cumulativeLosses' | 'status' | 'personnel' | 'equipment' | 'ammunition' | 'fuel'>): UnitState => ({
  ...data,
  personnel: 0,
  equipment: 0,
  ammunition: 0,
  fuel: 0,
  status: 'operational',
  cumulativeLosses: 0,
  history: [],
});

/**
 * Ardennes 1944 — Wacht am Rhein.
 *
 * Canonical resources are authoritative in ardennes1944Canonical.ts. The
 * ScenarioState resource fields are derived at module load and reconciled again
 * by canonical simulation start; they are not hand-authored source data.
 */
const baseScenario: ScenarioState = {
  id: 'ww2-ardennes-1944',
  name: 'Ardennes 1944 — Wacht am Rhein',
  era: 'ww2',
  scale: 'operational',
  turnHours: 6,
  elapsedHours: 0,
  weather: 0.82,
  terrain: 0.85,
  intelLevel: 0.55,
  units: {
    'g-1ss': unit({ id: 'g-1ss', name: '1st SS Panzer Division Leibstandarte', side: 'enemy', echelon: 'division', position: { lon: 6.35, lat: 50.34 }, readiness: 0.92, training: 0.84, experience: 0.86, morale: 0.88, cohesion: 0.90, fatigue: 0.08, wear: 0.14, logistics: 0.68, commandQuality: 0.84, intelligence: 0.56, combatPower: 0.95 }),
    'g-12ss': unit({ id: 'g-12ss', name: '12th SS Panzer Division Hitlerjugend', side: 'enemy', echelon: 'division', position: { lon: 6.20, lat: 50.43 }, readiness: 0.88, training: 0.62, experience: 0.56, morale: 0.82, cohesion: 0.82, fatigue: 0.10, wear: 0.16, logistics: 0.66, commandQuality: 0.78, intelligence: 0.52, combatPower: 0.88 }),
    'g-2pd': unit({ id: 'g-2pd', name: '2nd Panzer Division', side: 'enemy', echelon: 'division', position: { lon: 6.08, lat: 50.15 }, readiness: 0.90, training: 0.86, experience: 0.88, morale: 0.84, cohesion: 0.86, fatigue: 0.08, wear: 0.14, logistics: 0.70, commandQuality: 0.86, intelligence: 0.58, combatPower: 0.93 }),
    'g-pl': unit({ id: 'g-pl', name: 'Panzer Lehr Division', side: 'enemy', echelon: 'division', position: { lon: 6.18, lat: 50.05 }, readiness: 0.86, training: 0.90, experience: 0.88, morale: 0.80, cohesion: 0.88, fatigue: 0.10, wear: 0.18, logistics: 0.68, commandQuality: 0.86, intelligence: 0.60, combatPower: 0.90 }),
    'g-26vgd': unit({ id: 'g-26vgd', name: '26th Volksgrenadier Division', side: 'enemy', parentId: 'g-pl', echelon: 'division', position: { lon: 5.95, lat: 50.00 }, readiness: 0.70, training: 0.55, experience: 0.50, morale: 0.62, cohesion: 0.64, fatigue: 0.16, wear: 0.24, logistics: 0.58, commandQuality: 0.62, intelligence: 0.48, combatPower: 0.64 }),
    'g-18vgd': unit({ id: 'g-18vgd', name: '18th Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.18, lat: 50.30 }, readiness: 0.72, training: 0.62, experience: 0.54, morale: 0.66, cohesion: 0.68, fatigue: 0.14, wear: 0.22, logistics: 0.60, commandQuality: 0.66, intelligence: 0.50, combatPower: 0.68 }),
    'g-62vgd': unit({ id: 'g-62vgd', name: '62nd Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.28, lat: 50.20 }, readiness: 0.70, training: 0.60, experience: 0.52, morale: 0.64, cohesion: 0.66, fatigue: 0.15, wear: 0.22, logistics: 0.60, commandQuality: 0.64, intelligence: 0.48, combatPower: 0.66 }),
    'a-101ab': unit({ id: 'a-101ab', name: '101st Airborne Division', side: 'allied', echelon: 'division', position: { lon: 4.32, lat: 49.05 }, readiness: 0.88, training: 0.86, experience: 0.82, morale: 0.90, cohesion: 0.90, fatigue: 0.08, wear: 0.12, logistics: 0.82, commandQuality: 0.88, intelligence: 0.72, combatPower: 0.82, order: { type: 'move', destination: { lon: 5.71844, lat: 50.003472 }, priority: 'high', posture: 'aggressive', text: 'Emergency movement to Bastogne.' } }),
    'a-7ad': unit({ id: 'a-7ad', name: '7th Armored Division', side: 'allied', echelon: 'division', position: { lon: 5.98, lat: 50.89 }, readiness: 0.86, training: 0.82, experience: 0.80, morale: 0.82, cohesion: 0.84, fatigue: 0.10, wear: 0.14, logistics: 0.78, commandQuality: 0.82, intelligence: 0.68, combatPower: 0.88, order: { type: 'move', destination: { lon: 6.13, lat: 50.28 }, priority: 'high', posture: 'normal', text: 'Emergency movement toward St. Vith.' } }),
  },
  events: [
    { turn: 0, phase: 'combat', message: '16 Dec 1944: German offensive Wacht am Rhein opens across the Ardennes.', unitIds: ['g-1ss', 'g-12ss', 'g-2pd', 'g-pl', 'g-26vgd', 'g-18vgd', 'g-62vgd'] },
    { turn: 1, phase: 'movement', message: '17 Dec 1944: U.S. 101st Airborne Division is ordered north toward Bastogne; 7th Armored Division begins movement toward the St. Vith sector.', unitIds: ['a-101ab', 'a-7ad'] },
    { turn: 2, phase: 'movement', message: '18 Dec 1944: German armored forces continue the central advance toward Bastogne and the Meuse; Allied reserves converge on threatened road centers.', unitIds: ['g-2pd', 'g-pl', 'a-101ab', 'a-7ad'] },
  ],
  locations: [
    { id: 'bastogne', name: 'Bastogne', position: { lon: 5.71844, lat: 50.003472 } },
    { id: 'st-vith', name: 'St. Vith', position: { lon: 6.126, lat: 50.281 } },
    { id: 'clervaux', name: 'Clervaux', position: { lon: 6.03, lat: 50.05 } },
    { id: 'losheim', name: 'Losheim', position: { lon: 6.40, lat: 50.34 } },
    { id: 'rocherath', name: 'Rocherath', position: { lon: 6.24, lat: 50.48 } },
    { id: 'meuse-dinant', name: 'Dinant / Meuse crossing area', position: { lon: 4.91, lat: 50.26 } },
  ],
};

export const ardennes1944: ScenarioState = reconcileScenarioResourceAggregates(baseScenario, ardennes1944Canonical);

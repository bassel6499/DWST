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
 *
 * The opening state is anchored to 16 Dec 1944. V Corps' northern shoulder
 * and VIII Corps' central/southern sector are represented separately, while
 * later formations remain off the initial line and enter through their orders.
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
    // German 6th Panzer Army / northern sector.
    'g-1ss': unit({ id: 'g-1ss', name: '1st SS Panzer Division Leibstandarte', side: 'enemy', echelon: 'division', position: { lon: 6.35, lat: 50.34 }, readiness: 0.92, training: 0.84, experience: 0.86, morale: 0.88, cohesion: 0.90, fatigue: 0.08, wear: 0.14, logistics: 0.68, commandQuality: 0.84, intelligence: 0.56, combatPower: 0.95 }),
    'g-12ss': unit({ id: 'g-12ss', name: '12th SS Panzer Division Hitlerjugend', side: 'enemy', echelon: 'division', position: { lon: 6.20, lat: 50.43 }, readiness: 0.88, training: 0.62, experience: 0.56, morale: 0.82, cohesion: 0.82, fatigue: 0.10, wear: 0.16, logistics: 0.66, commandQuality: 0.78, intelligence: 0.52, combatPower: 0.88 }),
    'g-3fj': unit({ id: 'g-3fj', name: '3rd Fallschirmjäger Division', side: 'enemy', echelon: 'division', position: { lon: 6.13, lat: 50.43 }, readiness: 0.78, training: 0.72, experience: 0.70, morale: 0.78, cohesion: 0.76, fatigue: 0.10, wear: 0.18, logistics: 0.62, commandQuality: 0.70, intelligence: 0.50, combatPower: 0.70 }),
    'g-326vgd': unit({ id: 'g-326vgd', name: '326th Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.39, lat: 50.36 }, readiness: 0.72, training: 0.56, experience: 0.52, morale: 0.64, cohesion: 0.66, fatigue: 0.14, wear: 0.22, logistics: 0.58, commandQuality: 0.64, intelligence: 0.48, combatPower: 0.64 }),
    'g-277vgd': unit({ id: 'g-277vgd', name: '277th Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.08, lat: 50.42 }, readiness: 0.72, training: 0.58, experience: 0.54, morale: 0.66, cohesion: 0.68, fatigue: 0.14, wear: 0.22, logistics: 0.58, commandQuality: 0.64, intelligence: 0.48, combatPower: 0.65 }),

    // German 5th Panzer Army / central sector.
    'g-2pd': unit({ id: 'g-2pd', name: '2nd Panzer Division', side: 'enemy', echelon: 'division', position: { lon: 6.08, lat: 50.15 }, readiness: 0.90, training: 0.86, experience: 0.88, morale: 0.84, cohesion: 0.86, fatigue: 0.08, wear: 0.14, logistics: 0.70, commandQuality: 0.86, intelligence: 0.58, combatPower: 0.93 }),
    'g-pl': unit({ id: 'g-pl', name: 'Panzer Lehr Division', side: 'enemy', echelon: 'division', position: { lon: 6.18, lat: 50.05 }, readiness: 0.86, training: 0.90, experience: 0.88, morale: 0.80, cohesion: 0.88, fatigue: 0.10, wear: 0.18, logistics: 0.68, commandQuality: 0.86, intelligence: 0.60, combatPower: 0.90 }),
    'g-26vgd': unit({ id: 'g-26vgd', name: '26th Volksgrenadier Division', side: 'enemy', parentId: 'g-pl', echelon: 'division', position: { lon: 5.95, lat: 50.00 }, readiness: 0.70, training: 0.55, experience: 0.50, morale: 0.62, cohesion: 0.64, fatigue: 0.16, wear: 0.24, logistics: 0.58, commandQuality: 0.62, intelligence: 0.48, combatPower: 0.64 }),
    'g-18vgd': unit({ id: 'g-18vgd', name: '18th Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.18, lat: 50.30 }, readiness: 0.72, training: 0.62, experience: 0.54, morale: 0.66, cohesion: 0.68, fatigue: 0.14, wear: 0.22, logistics: 0.60, commandQuality: 0.66, intelligence: 0.50, combatPower: 0.68 }),
    'g-62vgd': unit({ id: 'g-62vgd', name: '62nd Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.28, lat: 50.20 }, readiness: 0.70, training: 0.60, experience: 0.52, morale: 0.64, cohesion: 0.66, fatigue: 0.15, wear: 0.22, logistics: 0.60, commandQuality: 0.64, intelligence: 0.48, combatPower: 0.66 }),
    'g-116pd': unit({ id: 'g-116pd', name: '116th Panzer Division', side: 'enemy', echelon: 'division', position: { lon: 6.32, lat: 50.16 }, readiness: 0.80, training: 0.78, experience: 0.76, morale: 0.76, cohesion: 0.78, fatigue: 0.10, wear: 0.18, logistics: 0.64, commandQuality: 0.76, intelligence: 0.52, combatPower: 0.78 }),
    'g-560vgd': unit({ id: 'g-560vgd', name: '560th Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.43, lat: 50.22 }, readiness: 0.66, training: 0.52, experience: 0.48, morale: 0.60, cohesion: 0.62, fatigue: 0.16, wear: 0.24, logistics: 0.56, commandQuality: 0.60, intelligence: 0.46, combatPower: 0.60 }),

    // German 7th Army / southern sector.
    'g-5fj': unit({ id: 'g-5fj', name: '5th Fallschirmjäger Division', side: 'enemy', echelon: 'division', position: { lon: 5.96, lat: 49.90 }, readiness: 0.74, training: 0.70, experience: 0.62, morale: 0.72, cohesion: 0.72, fatigue: 0.12, wear: 0.20, logistics: 0.58, commandQuality: 0.68, intelligence: 0.46, combatPower: 0.66 }),
    'g-352vgd': unit({ id: 'g-352vgd', name: '352nd Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.02, lat: 49.82 }, readiness: 0.70, training: 0.62, experience: 0.54, morale: 0.64, cohesion: 0.66, fatigue: 0.14, wear: 0.22, logistics: 0.56, commandQuality: 0.64, intelligence: 0.46, combatPower: 0.62 }),
    'g-212vgd': unit({ id: 'g-212vgd', name: '212th Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.08, lat: 49.74 }, readiness: 0.68, training: 0.60, experience: 0.52, morale: 0.62, cohesion: 0.64, fatigue: 0.15, wear: 0.22, logistics: 0.56, commandQuality: 0.62, intelligence: 0.44, combatPower: 0.60 }),
    'g-276vgd': unit({ id: 'g-276vgd', name: '276th Volksgrenadier Division', side: 'enemy', echelon: 'division', position: { lon: 6.20, lat: 49.78 }, readiness: 0.68, training: 0.58, experience: 0.50, morale: 0.62, cohesion: 0.64, fatigue: 0.15, wear: 0.22, logistics: 0.56, commandQuality: 0.62, intelligence: 0.44, combatPower: 0.60 }),

    // U.S. V Corps / northern shoulder.
    'a-99id': unit({ id: 'a-99id', name: '99th Infantry Division', side: 'allied', echelon: 'division', position: { lon: 6.18, lat: 50.49 }, readiness: 0.82, training: 0.82, experience: 0.74, morale: 0.78, cohesion: 0.80, fatigue: 0.12, wear: 0.14, logistics: 0.76, commandQuality: 0.78, intelligence: 0.66, combatPower: 0.76 }),
    'a-2id': unit({ id: 'a-2id', name: '2nd Infantry Division', side: 'allied', echelon: 'division', position: { lon: 6.06, lat: 50.52 }, readiness: 0.84, training: 0.88, experience: 0.86, morale: 0.82, cohesion: 0.84, fatigue: 0.10, wear: 0.14, logistics: 0.78, commandQuality: 0.82, intelligence: 0.68, combatPower: 0.82 }),

    // U.S. VIII Corps / central and southern sectors.
    'a-106id': unit({ id: 'a-106id', name: '106th Infantry Division', side: 'allied', echelon: 'division', position: { lon: 6.10, lat: 50.31 }, readiness: 0.78, training: 0.68, experience: 0.36, morale: 0.66, cohesion: 0.66, fatigue: 0.10, wear: 0.12, logistics: 0.74, commandQuality: 0.70, intelligence: 0.58, combatPower: 0.64 }),
    'a-28id': unit({ id: 'a-28id', name: '28th Infantry Division', side: 'allied', echelon: 'division', position: { lon: 5.72, lat: 49.96 }, readiness: 0.84, training: 0.84, experience: 0.82, morale: 0.82, cohesion: 0.84, fatigue: 0.10, wear: 0.16, logistics: 0.76, commandQuality: 0.80, intelligence: 0.62, combatPower: 0.80 }),
    'a-9ad': unit({ id: 'a-9ad', name: '9th Armored Division', side: 'allied', echelon: 'division', position: { lon: 5.76, lat: 50.12 }, readiness: 0.76, training: 0.76, experience: 0.72, morale: 0.76, cohesion: 0.76, fatigue: 0.12, wear: 0.18, logistics: 0.72, commandQuality: 0.74, intelligence: 0.60, combatPower: 0.76 }),
    'a-4id': unit({ id: 'a-4id', name: '4th Infantry Division', side: 'allied', echelon: 'division', position: { lon: 5.96, lat: 49.75 }, readiness: 0.86, training: 0.88, experience: 0.86, morale: 0.84, cohesion: 0.86, fatigue: 0.10, wear: 0.14, logistics: 0.78, commandQuality: 0.82, intelligence: 0.66, combatPower: 0.84 }),

    // Reinforcements/reserves: deliberately off the opening line.
    'a-101ab': unit({ id: 'a-101ab', name: '101st Airborne Division', side: 'allied', echelon: 'division', position: { lon: 4.32, lat: 49.05 }, readiness: 0.88, training: 0.86, experience: 0.82, morale: 0.90, cohesion: 0.90, fatigue: 0.08, wear: 0.12, logistics: 0.82, commandQuality: 0.88, intelligence: 0.72, combatPower: 0.82, order: { type: 'move', destination: { lon: 5.71844, lat: 50.003472 }, priority: 'high', posture: 'aggressive', text: 'Emergency movement to Bastogne after the German breakthrough.' } }),
    'a-7ad': unit({ id: 'a-7ad', name: '7th Armored Division', side: 'allied', echelon: 'division', position: { lon: 5.98, lat: 50.89 }, readiness: 0.86, training: 0.82, experience: 0.80, morale: 0.82, cohesion: 0.84, fatigue: 0.10, wear: 0.14, logistics: 0.78, commandQuality: 0.82, intelligence: 0.68, combatPower: 0.88, order: { type: 'move', destination: { lon: 6.126, lat: 50.281 }, priority: 'high', posture: 'normal', text: 'Emergency movement toward the St. Vith sector.' } }),
  },
  events: [
    { turn: 0, phase: 'combat', message: '16 Dec 1944: Wacht am Rhein opens with the German artillery preparation and attacks across the Ardennes.', unitIds: ['g-1ss', 'g-12ss', 'g-3fj', 'g-326vgd', 'g-277vgd', 'g-2pd', 'g-pl', 'g-26vgd', 'g-18vgd', 'g-62vgd', 'g-116pd', 'g-560vgd', 'g-5fj', 'g-352vgd', 'g-212vgd', 'g-276vgd'] },
    { turn: 1, phase: 'movement', message: '17 Dec 1944: Allied emergency reinforcement begins; the 101st Airborne is ordered toward Bastogne and the 7th Armored Division toward St. Vith.', unitIds: ['a-101ab', 'a-7ad'] },
    { turn: 2, phase: 'movement', message: '18 Dec 1944: German armored formations continue the central advance while Allied reserves converge on threatened road centers.', unitIds: ['g-2pd', 'g-pl', 'g-116pd', 'a-101ab', 'a-7ad'] },
  ],
  locations: [
    { id: 'monschau', name: 'Monschau', position: { lon: 6.24, lat: 50.55 } },
    { id: 'hoefen', name: 'Höfen', position: { lon: 6.25, lat: 50.55 } },
    { id: 'krinkelt-rocherath', name: 'Krinkelt-Rocherath', position: { lon: 6.24, lat: 50.48 } },
    { id: 'losheim', name: 'Losheim', position: { lon: 6.40, lat: 50.34 } },
    { id: 'clervaux', name: 'Clervaux', position: { lon: 6.03, lat: 50.05 } },
    { id: 'st-vith', name: 'St. Vith', position: { lon: 6.126, lat: 50.281 } },
    { id: 'bastogne', name: 'Bastogne', position: { lon: 5.71844, lat: 50.003472 } },
    { id: 'malmedy', name: 'Malmedy', position: { lon: 6.03, lat: 50.43 } },
    { id: 'dinant-meuse', name: 'Dinant / Meuse crossing area', position: { lon: 4.91, lat: 50.26 } },
  ],
};

export const ardennes1944: ScenarioState = reconcileScenarioResourceAggregates(baseScenario, ardennes1944Canonical);

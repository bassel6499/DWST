import type { CombatUnitContext } from '../../core/combatContext';
import type { UnitState } from '../../core/types';

export type WW2TerrainType =
  | 'open'
  | 'rolling'
  | 'forest'
  | 'urban'
  | 'ridge'
  | 'valley'
  | 'river'
  | 'marsh'
  | 'fortified';
export type WW2CombatPhase =
  | 'approach'
  | 'positioning'
  | 'preparation'
  | 'main_engagement'
  | 'assault'
  | 'exploitation';
export type WW2CombatOutcome =
  | 'attacker_repulsed'
  | 'attacker_stalls'
  | 'local_gain'
  | 'penetration'
  | 'breakthrough'
  | 'defender_withdraws';

export interface WW2CombatInput {
  attacker: UnitState;
  defender: UnitState;
  terrainDefense: number;
  weather: number;
  surprise: number;
  distanceKm?: number;
  terrainType?: WW2TerrainType;
  lineOfSight?: number;
  targetExposure?: number;
  artillerySupport?: number;
  armorSupport?: number;
  antiArmor?: number;
  airSupport?: number;
  maneuver?: number;
  command?: number;
  attackerContext?: CombatUnitContext;
  defenderContext?: CombatUnitContext;
}

export interface WW2EffectivenessFactors {
  readonly offenseA: number;
  readonly offenseB: number;
  readonly alpha: number;
  readonly beta: number;
  readonly attackerMobility: number;
  readonly defenderMobility: number;
  readonly command: number;
  readonly maneuver: number;
  readonly terrain: number;
  readonly weather: number;
  readonly surprise: number;
  readonly exposure: number;
  readonly attackerEquipment: number;
  readonly defenderEquipment: number;
  readonly reactionDelayHours: number;
}

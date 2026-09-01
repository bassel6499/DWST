/**
 * Generic, read-only combat capability projection supplied by the canonical
 * state boundary. Era rules may interpret these capabilities; the projection
 * itself does not contain era-specific combat rules.
 */
export interface CombatUnitContext {
  readonly equipmentOperational: number;
  readonly equipmentDamaged: number;
  readonly equipmentDestroyed: number;
  readonly equipmentMissing: number;
  readonly crewRequired: number;
  readonly crewReady: number;
  readonly equipmentReady: number;
  readonly equipmentByType: Readonly<Record<string, number>>;
}

export interface CombatContext {
  readonly attacker?: CombatUnitContext;
  readonly defender?: CombatUnitContext;
}

export type CombatContextProvider = (unitId: string) => CombatContext | undefined;

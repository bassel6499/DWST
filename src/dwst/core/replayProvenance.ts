import type { EraRuleset } from './eraRules';
import type { Order } from './types';

/** Replay provenance is Core-owned metadata for deterministic reproduction. */
export interface ReplayCommand {
  readonly sequence: number;
  readonly turn: number;
  readonly unitId: string;
  readonly order: Readonly<Order> | null;
}

export interface ReplayProvenance {
  readonly modelVersion: 'dwst-core-v1';
  readonly rulesetId: EraRuleset['id'];
  readonly rulesetContentHash: string;
  readonly rng: null;
  readonly commands: readonly ReplayCommand[];
}

const stableSerialize = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`).join(',')}}`;
};

/** Deterministic content fingerprint used to identify the ruleset configuration. */
export function contentHash(value: unknown): string {
  let hash = 2166136261;
  for (const char of stableSerialize(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function getRulesetContentHash(rules: EraRuleset): string {
  return contentHash({
    id: rules.id,
    label: rules.label,
    implemented: rules.implemented,
    combatLaw: rules.combatLaw,
    rangedFire: rules.rangedFire,
    spatialModel: rules.spatialModel,
    defaultTurnHours: rules.defaultTurnHours,
    equipmentCrewCoupling: rules.equipmentCrewCoupling,
    permanentAttrition: rules.permanentAttrition,
    logisticsEnabled: rules.logisticsEnabled,
    engine: rules.engine,
    unitAssessment: rules.unitAssessment,
    detection: rules.detection,
    notes: rules.notes,
  });
}

const cloneOrder = (order: Readonly<Order>): Readonly<Order> => Object.freeze({
  ...order,
  destination: order.destination ? Object.freeze({ ...order.destination }) : undefined,
});

export function createReplayProvenance(
  rules: EraRuleset,
  commands: readonly ReplayCommand[] = [],
): ReplayProvenance {
  return Object.freeze({
    modelVersion: 'dwst-core-v1',
    rulesetId: rules.id,
    rulesetContentHash: getRulesetContentHash(rules),
    rng: null,
    commands: Object.freeze(commands.map((command) => Object.freeze({
      ...command,
      order: command.order ? cloneOrder(command.order) : null,
    }))),
  });
}

export function appendReplayCommands(
  provenance: ReplayProvenance,
  turn: number,
  orders: Readonly<Record<string, Order | undefined>>,
): ReplayProvenance {
  const additions: ReplayCommand[] = Object.keys(orders).sort().map((unitId, index) => ({
    sequence: provenance.commands.length + index,
    turn,
    unitId,
    order: orders[unitId] ? cloneOrder(orders[unitId]!) : null,
  }));

  return Object.freeze({
    ...provenance,
    commands: Object.freeze([...provenance.commands, ...additions]),
  });
}

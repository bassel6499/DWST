import type { CanonicalState } from './canonicalState';
import type { ReplayProvenance } from './replayProvenance';
import type { ScenarioState } from './types';

/**
 * Versioned, JSON-safe persistence envelopes for authoritative DWST state.
 * Serialization is deliberately explicit so future schema changes can be
 * rejected rather than silently changing simulation semantics.
 */
export const DWST_SERIALIZATION_VERSION = 1 as const;

type SerializationEnvelope<T> = {
  readonly format: 'dwst';
  readonly version: typeof DWST_SERIALIZATION_VERSION;
  readonly kind: 'scenario-state' | 'canonical-state' | 'replay-provenance';
  readonly data: T;
};

const assertFiniteNumbers = (value: unknown, path = '$'): void => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Cannot serialize non-finite number at ${path}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteNumbers(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      assertFiniteNumbers(child, `${path}.${key}`);
    }
  }
};

const encode = <T>(kind: SerializationEnvelope<T>['kind'], data: T): string => {
  assertFiniteNumbers(data);
  return JSON.stringify({ format: 'dwst', version: DWST_SERIALIZATION_VERSION, kind, data });
};

const decode = <T>(text: string, expectedKind: SerializationEnvelope<T>['kind']): T => {
  let envelope: unknown;
  try {
    envelope = JSON.parse(text);
  } catch {
    throw new Error('Invalid DWST serialized JSON');
  }

  if (!envelope || typeof envelope !== 'object') throw new Error('Invalid DWST serialization envelope');
  const candidate = envelope as Partial<SerializationEnvelope<T>>;
  if (candidate.format !== 'dwst') throw new Error('Unsupported DWST serialization format');
  if (candidate.version !== DWST_SERIALIZATION_VERSION) throw new Error(`Unsupported DWST serialization version: ${String(candidate.version)}`);
  if (candidate.kind !== expectedKind) throw new Error(`Unexpected DWST serialization kind: ${String(candidate.kind)}`);
  if (!('data' in candidate)) throw new Error('DWST serialization envelope is missing data');

  assertFiniteNumbers(candidate.data);
  return candidate.data as T;
};

/** Round-trip an authoritative ScenarioState without changing its semantics. */
export const serializeScenarioState = (state: ScenarioState): string => encode('scenario-state', state);
export const deserializeScenarioState = (text: string): ScenarioState => decode('scenario-state', text);

/** Round-trip canonical personnel/equipment/crew/definition/consumable state. */
export const serializeCanonicalState = (state: CanonicalState): string => encode('canonical-state', state);
export const deserializeCanonicalState = (text: string): CanonicalState => decode('canonical-state', text);

/** Round-trip replay provenance, including its command journal and ruleset fingerprint. */
export const serializeReplayProvenance = (provenance: ReplayProvenance): string => encode('replay-provenance', provenance);
export const deserializeReplayProvenance = (text: string): ReplayProvenance => decode('replay-provenance', text);

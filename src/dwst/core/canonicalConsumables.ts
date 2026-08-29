export interface CanonicalConsumableState {
  unitId: string;
  ammunition: number;
  fuel: number;
}

/** Canonical consumable quantities owned by a unit. Values are normalized to [0, 1]. */
export function validateCanonicalConsumables(records: CanonicalConsumableState[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.unitId)) errors.push(`Duplicate canonical consumable record for unit ${record.unitId}`);
    seen.add(record.unitId);
    if (!Number.isFinite(record.ammunition) || record.ammunition < 0 || record.ammunition > 1) {
      errors.push(`Invalid canonical ammunition for unit ${record.unitId}`);
    }
    if (!Number.isFinite(record.fuel) || record.fuel < 0 || record.fuel > 1) {
      errors.push(`Invalid canonical fuel for unit ${record.unitId}`);
    }
  }
  return errors;
}

export function projectCanonicalConsumables(
  unitId: string,
  records: CanonicalConsumableState[],
): CanonicalConsumableState {
  const record = records.find((candidate) => candidate.unitId === unitId);
  if (!record) throw new Error(`Missing canonical consumable coverage for unit ${unitId}`);
  return { ...record };
}

export function commitCanonicalConsumableState(
  records: CanonicalConsumableState[],
  next: CanonicalConsumableState,
): CanonicalConsumableState[] {
  const errors = validateCanonicalConsumables([next]);
  if (errors.length) throw new Error(errors.join('; '));
  const found = records.some((record) => record.unitId === next.unitId);
  if (!found) throw new Error(`Missing canonical consumable record for unit ${next.unitId}`);
  return records.map((record) => record.unitId === next.unitId ? { ...next } : { ...record });
}

import type { PersonnelRecord, PersonnelRegistry, PersonnelStatus } from './personnelRegistry';
import { personnelStatusCounts } from './personnelRegistry';

export interface PersonnelOperation { kind:'setStatus'; personnelId:string; status:PersonnelStatus; }
export interface PersonnelTransitionResult { registry:PersonnelRegistry; errors:string[]; }

function clone<T>(x:T):T { return structuredClone(x); }

/** Pure transactional personnel transition. Unknown IDs and invalid transitions are rejected. */
export function applyPersonnelOperations(input:PersonnelRegistry, operations:PersonnelOperation[]):PersonnelTransitionResult {
  const next=clone(input); const errors:string[]=[];
  for(const op of operations){
    const person:PersonnelRecord|undefined=next.personnel.find(p=>p.id===op.personnelId);
    if(!person){ errors.push(`Unknown personnel ID: ${op.personnelId}`); continue; }
    if(person.status==='killed' && op.status!=='killed') { errors.push(`Killed personnel cannot change status: ${op.personnelId}`); continue; }
    person.status=op.status;
  }
  if(errors.length)return {registry:input,errors};
  return {registry:next,errors:[]};
}

/**
 * Compatibility validator for callers that still compare derived personnel counts.
 * It does not maintain or read a legacy ledger; counts are always derived from the
 * canonical PersonnelRegistry.
 */
export function assertPersonnelLedgerMatchesRegistry(
  registry:PersonnelRegistry,
  expected:Record<PersonnelStatus,number>,
):string[] {
  const actual=personnelStatusCounts(registry);
  const errors:string[]=[];
  for(const status of Object.keys(actual) as PersonnelStatus[]) {
    if(actual[status]!==expected[status]) errors.push(`Personnel ${status} count mismatch: expected ${expected[status]}, got ${actual[status]}`);
  }
  return errors;
}

import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { personnelStatusCounts } from './personnelRegistry';
import { assertPersonnelLedgerMatchesRegistry } from './personnelTransitions';

describe('personnel ledger consistency',()=>{
 const registry={personnel:[
  {id:'P1',status:'available' as const,qualifications:[],experience:{}},
  {id:'P2',status:'assigned' as const,qualifications:['tankCrew'],experience:{trained:1}},
  {id:'P3',status:'training' as const,qualifications:[],experience:{}},
  {id:'P4',status:'wounded' as const,qualifications:[],experience:{}},
  {id:'P5',status:'missing' as const,qualifications:[],experience:{}},
  {id:'P6',status:'killed' as const,qualifications:[],experience:{}},
 ]};
 it('matches registry status counts to the ledger',()=>{
  const counts=personnelStatusCounts(registry);
  assert.equal(registry.personnel.length,6);
  assert.equal(counts.available,1);
  assert.equal(counts.assigned,1);
  assert.equal(counts.training,1);
  assert.equal(counts.wounded,1);
  assert.equal(counts.missing,1);
  assert.equal(counts.killed,1);
  assert.deepEqual(assertPersonnelLedgerMatchesRegistry(registry,counts),[]);
  assert.ok(assertPersonnelLedgerMatchesRegistry(registry,{...counts,available:2}).length>0);
 });
});

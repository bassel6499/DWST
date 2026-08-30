import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { personnelStatusCounts } from './personnelRegistry';

describe('personnel registry consistency',()=>{
 const registry={personnel:[
  {id:'P1',status:'available' as const,qualifications:[],experience:{}},
  {id:'P2',status:'assigned' as const,qualifications:['tankCrew'],experience:{trained:1}},
  {id:'P3',status:'training' as const,qualifications:[],experience:{}},
  {id:'P4',status:'wounded' as const,qualifications:[],experience:{}},
  {id:'P5',status:'missing' as const,qualifications:[],experience:{}},
  {id:'P6',status:'killed' as const,qualifications:[],experience:{}},
 ]};
 it('derives status counts directly from the canonical registry',()=>{
  const counts=personnelStatusCounts(registry);
  assert.equal(registry.personnel.length,6);
  assert.deepEqual(counts,{available:1,assigned:1,training:1,wounded:1,missing:1,killed:1});
 });
});
import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { migrateLegacyForce } from './legacyMigration';

describe('legacy force migration',()=>{
 const ledger:any={personnel:{available:10,assigned:0,training:0,killed:0},equipment:[],specialists:[]};
 it('keeps valid legacy manpower aggregate-only',()=>{
  const migrated=migrateLegacyForce({personnel:10},ledger);
  assert.deepEqual(migrated.errors,[]);
  assert.equal(migrated.registry.personnel.length,0);
  assert.ok(migrated.warnings.some(x=>x.includes('aggregate-only')));
  assert.ok(migrated.warnings.some(x=>x.includes('not fabricated')));
  assert.ok(migrated.warnings.some(x=>x.includes('not inferred')));
 });
 it('rejects invalid legacy manpower',()=>{
  const zero=migrateLegacyForce({personnel:0},ledger);
  assert.deepEqual(zero.errors,[]);
  assert.equal(zero.registry.personnel.length,0);
  const negative=migrateLegacyForce({personnel:-1},ledger);
  assert.ok(negative.errors.length>0);
  assert.equal(negative.registry.personnel.length,0);
  const fractional=migrateLegacyForce({personnel:1.5},ledger);
  assert.ok(fractional.errors.length>0);
  assert.equal(fractional.registry.personnel.length,0);
 });
});

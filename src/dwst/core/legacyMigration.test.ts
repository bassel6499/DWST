import { strict as assert } from 'node:assert';
import { migrateLegacyForce } from './legacyMigration';

describe('legacy force migration',()=>{
 const ledger:any={personnel:{available:10,assigned:0,training:0,killed:0},equipment:[],specialists:[]};
 it('migrates valid legacy manpower conservatively',()=>{
  const migrated=migrateLegacyForce({personnel:10},ledger);
  assert.deepEqual(migrated.errors,[]);
  assert.equal(migrated.registry.personnel.length,10);
  assert.ok(migrated.warnings.some(x=>x.includes('synthetic')));
  assert.ok(migrated.warnings.some(x=>x.includes('not inferred')));
  assert.ok(migrated.registry.personnel.every(p=>p.qualifications.length===0));
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

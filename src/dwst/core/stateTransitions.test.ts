import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { applyResourceOperations } from './stateTransitions';

describe('state transitions',()=>{
 const base={
  personnel:{total:4,available:2,assigned:1,training:1,wounded:0,missing:0,killed:0},
  specialists:[{specialty:'tankCrew' as any,personnelIds:['P2','P3'],personnel:2,qualified:1,training:1,casualties:0,veteran:0,experienced:0,trained:1}],
  equipment:[{type:'tank' as any,designation:'Tank 1',total:1,operational:1,damaged:0,destroyed:0,assigned:0}],
  links:[{equipmentId:'Tank 1',crewSpecialty:'tankCrew' as any,requiredQualifiedCrew:1}]
 };
 const registry:any={personnel:[
  {id:'P1',status:'available',qualifications:['tankCrew'],experience:{}},
  {id:'P2',status:'assigned',qualifications:['tankCrew'],experience:{}},
  {id:'P3',status:'training',qualifications:['tankCrew'],experience:{}},
  {id:'P4',status:'available',qualifications:['tankCrew'],experience:{}}
 ]};
 it('applies equipment damage with validation',()=>{
  const failed=applyResourceOperations(base,[{kind:'damageEquipment',equipmentId:'Tank 1',amount:2},{kind:'damageEquipment',equipmentId:'missing',amount:1}]);
  assert.equal(failed.errors.length,1); assert.equal(failed.ledger.equipment[0].operational,1);
  const damaged=applyResourceOperations(base,[{kind:'damageEquipment',equipmentId:'Tank 1',amount:1}]);
  assert.equal(damaged.errors.length,0); assert.equal(damaged.ledger.equipment[0].operational,0); assert.equal(damaged.ledger.equipment[0].damaged,1);
 });
 it('completes specialist training',()=>{
  const trained=applyResourceOperations(base,[{kind:'completeTraining',personnelId:'P3',specialty:'tankCrew' as any}],registry);
  assert.equal(trained.errors.length,0); assert.equal(trained.ledger.specialists[0].qualified,2); assert.equal(trained.ledger.specialists[0].training,0); assert.equal(trained.registry?.personnel.find(p=>p.id==='P3')?.status,'available');
 });
 it('assigns, casualties create a vacancy, and a qualified replacement restores the crew',()=>{
  const assigned=applyResourceOperations(base,[{kind:'assignPersonnel',personnelId:'P1',equipmentId:'Tank 1',slot:1,specialty:'tankCrew'}],registry);
  assert.equal(assigned.errors.length,0); assert.equal(assigned.registry?.personnel.find(p=>p.id==='P1')?.status,'assigned'); assert.equal(assigned.assignments?.length,1);
  const casualty=applyResourceOperations(assigned.ledger,[{kind:'killPersonnel',personnelId:'P1'}],assigned.registry,assigned.assignments);
  assert.equal(casualty.errors.length,0); assert.equal(casualty.registry?.personnel.find(p=>p.id==='P1')?.status,'killed'); assert.equal(casualty.assignments?.length,0);
  const replacement=applyResourceOperations(casualty.ledger,[{kind:'assignPersonnel',personnelId:'P4',equipmentId:'Tank 1',slot:1,specialty:'tankCrew'}],casualty.registry,casualty.assignments);
  assert.equal(replacement.errors.length,0); assert.equal(replacement.registry?.personnel.find(p=>p.id==='P4')?.status,'assigned'); assert.equal(replacement.assignments?.length,1);
 });
 it('rejects invalid assignment and leaves a failed transaction unchanged',()=>{
  const before=structuredClone(registry);
  const failed=applyResourceOperations(base,[{kind:'assignPersonnel',personnelId:'P3',equipmentId:'Tank 1',slot:1,specialty:'tankCrew'},{kind:'assignPersonnel',personnelId:'P1',equipmentId:'missing',slot:1,specialty:'tankCrew'}],registry);
  assert.ok(failed.errors.length>0); assert.deepEqual(failed.registry,registry); assert.deepEqual(failed.assignments,[]);
  assert.deepEqual(before,registry);
 });
 it('rejects assignment of killed, wounded, missing, or training personnel',()=>{
  for(const status of ['killed','wounded','missing','training']){
   const r:any={personnel:registry.personnel.map((p:any)=>p.id==='P1'?{...p,status}:p)};
   const result=applyResourceOperations(base,[{kind:'assignPersonnel',personnelId:'P1',equipmentId:'Tank 1',slot:1,specialty:'tankCrew'}],r);
   assert.ok(result.errors.length>0);
  }
 });
});
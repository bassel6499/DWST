import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { crewedEquipmentCount, validateCrewAssignments } from './crewAssignments';

describe('crew assignments',()=>{
 const registry:any={personnel:[
  {id:'P1',status:'assigned',qualifications:['tankCrew'],experience:{}},{id:'P2',status:'assigned',qualifications:['tankCrew'],experience:{}},{id:'P3',status:'assigned',qualifications:['tankCrew'],experience:{}},{id:'P4',status:'assigned',qualifications:['tankCrew'],experience:{}},{id:'P5',status:'assigned',qualifications:['tankCrew'],experience:{}},{id:'P6',status:'assigned',qualifications:['tankCrew'],experience:{}},
  {id:'W1',status:'wounded',qualifications:['tankCrew'],experience:{}},{id:'K1',status:'killed',qualifications:['tankCrew'],experience:{}},{id:'M1',status:'missing',qualifications:['tankCrew'],experience:{}},{id:'T1',status:'training',qualifications:['tankCrew'],experience:{}},{id:'A1',status:'assigned',qualifications:['artilleryCrew'],experience:{}},
 ]};
 const equipment:any=[{id:'tank-1',name:'Tank 1',era:'WWII',equipmentType:'tank',crewRequirementId:'WWII:tank:tankCrew'},{id:'tank-modern',name:'Modern Tank',era:'Modern',equipmentType:'tank',crewRequirementId:'Modern:tank:tankCrew'}];
 it('supports casualty and qualified replacement without losing equipment identity',()=>{
  const full=[1,2,3,4,5].map((slot,i)=>({equipmentId:'tank-1',slot,personnelId:`P${i+1}`,specialty:'tankCrew'}));
  assert.deepEqual(validateCrewAssignments(full,registry,equipment),[]);
  assert.equal(crewedEquipmentCount(full,'tank-1',5),1);
  const casualty=full.filter(a=>a.personnelId!=='P3');
  assert.equal(crewedEquipmentCount(casualty,'tank-1',5),0);
  assert.deepEqual(validateCrewAssignments(casualty,registry,equipment),[]);
  const replacement=[...casualty,{equipmentId:'tank-1',slot:3,personnelId:'P6',specialty:'tankCrew'}];
  assert.deepEqual(validateCrewAssignments(replacement,registry,equipment),[]);
  assert.equal(crewedEquipmentCount(replacement,'tank-1',5),1);
  const duplicate=[...full,{equipmentId:'tank-1',slot:6,personnelId:'P1',specialty:'tankCrew'}];
  assert.ok(validateCrewAssignments(duplicate,registry,equipment).some(x=>x.includes('multiple')));
 });
 it('enforces authoritative equipment specialty and crew slot limits',()=>{
  const wrongSpecialty=[{equipmentId:'tank-1',slot:1,personnelId:'A1',specialty:'artilleryCrew'}];
  const errors=validateCrewAssignments(wrongSpecialty,registry,equipment);
  assert.ok(errors.some(x=>x.includes('required qualification tankCrew')));
  assert.ok(errors.some(x=>x.includes('does not match equipment requirement')));
  const tooMany=[1,2,3,4,5,6].map((slot,i)=>({equipmentId:'tank-1',slot,personnelId:`P${i+1}`,specialty:'tankCrew'}));
  assert.ok(validateCrewAssignments(tooMany,registry,equipment).some(x=>x.includes('Invalid crew slot')));
  const duplicateSlot=[
   {equipmentId:'tank-1',slot:1,personnelId:'P1',specialty:'tankCrew'},
   {equipmentId:'tank-1',slot:1,personnelId:'P2',specialty:'tankCrew'},
  ];
  assert.ok(validateCrewAssignments(duplicateSlot,registry,equipment).some(x=>x.includes('Duplicate crew slot')));
 });
 it('rejects personnel who are not currently available for crew duty',()=>{
  for(const id of ['W1','K1','M1','T1']){
   const errors=validateCrewAssignments([{equipmentId:'tank-1',slot:1,personnelId:id,specialty:'tankCrew'}],registry,equipment);
   assert.ok(errors.some(x=>x.includes('must be assigned')),id);
  }
 });
});

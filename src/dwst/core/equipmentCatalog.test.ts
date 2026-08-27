import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { resolveCrewRequirement, validateEquipmentDefinition } from './equipmentCatalog';

describe('equipment catalog',()=>{
 const panzerIV={id:'veh-panzer-iv',name:'Panzer IV',era:'WWII',equipmentType:'tank',crewRequirementId:'WWII:tank:tankCrew'};
 it('resolves valid equipment crew requirements',()=>{
  assert.deepEqual(validateEquipmentDefinition(panzerIV),[]);
  assert.equal(resolveCrewRequirement(panzerIV).requiredQualifiedCrew,5);
 });
 it('rejects incompatible or unknown crew requirements',()=>{
  const bad={...panzerIV,crewRequirementId:'WWII:tank:wrongCrew'};
  assert.ok(validateEquipmentDefinition(bad).some(x=>x.includes('mismatch')));
  const unknown={...panzerIV,equipmentType:'unknown'};
  assert.ok(validateEquipmentDefinition(unknown).some(x=>x.includes('Missing crew requirement')));
 });
});

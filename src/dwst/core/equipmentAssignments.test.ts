import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { usableEquipmentByCrew, validateAssignments } from './equipmentAssignments';

describe('equipment assignments',()=>{
 const pool={specialty:'tankCrew' as any,personnelIds:['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P12','P13','P14','P15','P16','P17','P18'],personnel:18,qualified:18,training:0,casualties:0,veteran:0,experienced:0,trained:18};
 const equipment={type:'tank' as any,designation:'Tank Company A',total:10,operational:10,damaged:0,destroyed:0,assigned:0};
 const link={equipmentId:'Tank Company A',crewSpecialty:'tankCrew' as any,requiredQualifiedCrew:2};
 it('caps usable equipment and validates complete crews',()=>{
  assert.equal(usableEquipmentByCrew(equipment,link,[pool]),9);
  assert.equal(validateAssignments([{equipmentId:'Tank Company A',personnelIds:['P1','P2']}],[equipment],[link],[pool]).length,0);
  assert.ok(validateAssignments([{equipmentId:'Tank Company A',personnelIds:['P1']}],[equipment],[link],[pool]).some(x=>x.includes('Crew size mismatch')));
  assert.ok(validateAssignments([{equipmentId:'Tank Company A',personnelIds:['P1','P2']},{equipmentId:'Tank Company A',personnelIds:['P2','P3']}],[equipment],[link],[pool]).some(x=>x.includes('multiple equipment')));
 });
});

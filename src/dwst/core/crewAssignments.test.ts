import { strict as assert } from 'node:assert';
import { crewedEquipmentCount, validateCrewAssignments } from './crewAssignments';

const registry:any={personnel:[
 {id:'P1',status:'assigned',qualifications:['tankCrew'],experience:{}},
 {id:'P2',status:'assigned',qualifications:['tankCrew'],experience:{}},
 {id:'P3',status:'assigned',qualifications:['tankCrew'],experience:{}},
 {id:'P4',status:'assigned',qualifications:['tankCrew'],experience:{}},
 {id:'P5',status:'assigned',qualifications:['tankCrew'],experience:{}},
 {id:'P6',status:'available',qualifications:['tankCrew'],experience:{}},
]};
const equipment:any=[{id:'tank-1',name:'Tank 1',era:'WWII',equipmentType:'tank',crewRequirementId:'WWII:tank:tankCrew'}];
const full=[1,2,3,4,5].map((slot,i)=>({equipmentId:'tank-1',slot,personnelId:`P${i+1}`,specialty:'tankCrew'}));
assert.deepEqual(validateCrewAssignments(full,registry,equipment),[]);
assert.equal(crewedEquipmentCount(full,'tank-1',5),1);

const casualty=full.filter(a=>a.personnelId!=='P3');
assert.equal(crewedEquipmentCount(casualty,'tank-1',5),0);
assert.ok(validateCrewAssignments(casualty,registry,equipment).length===0);

const replacement=[...casualty,{equipmentId:'tank-1',slot:3,personnelId:'P6',specialty:'tankCrew'}];
assert.deepEqual(validateCrewAssignments(replacement,registry,equipment),[]);
assert.equal(crewedEquipmentCount(replacement,'tank-1',5),1);

const duplicate=[...full,{equipmentId:'tank-1',slot:6,personnelId:'P1',specialty:'tankCrew'}];
assert.ok(validateCrewAssignments(duplicate,registry,equipment).some(x=>x.includes('multiple')));

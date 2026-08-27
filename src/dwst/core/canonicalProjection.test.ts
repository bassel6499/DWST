import { describe, expect, it } from 'vitest';
import { projectCanonicalUnit } from './canonicalProjection';
import type { EquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';
import type { PersonnelRegistry } from './personnelRegistry';

const definitions:EquipmentDefinition[]=[{id:'tank',name:'Tank',era:'WWII',equipmentType:'tank',crewRequirementId:'WWII:tank:tankCrew'}];
const instances:EquipmentInstance[]=[
 {instanceId:'a',definitionId:'tank',unitId:'u1',status:'operational'},
 {instanceId:'b',definitionId:'tank',unitId:'u1',status:'damaged'},
 {instanceId:'c',definitionId:'tank',unitId:'u2',status:'operational'},
];
const registry:PersonnelRegistry={personnel:[
 {id:'p1',unitId:'u1',status:'assigned',qualifications:['tankCrew'],experience:{}},
 {id:'p2',unitId:'u1',status:'assigned',qualifications:['tankCrew'],experience:{}},
 {id:'p3',unitId:'u2',status:'assigned',qualifications:['tankCrew'],experience:{}},
]};
const assignments:InstanceCrewAssignment[]=[
 {instanceId:'a',slot:1,personnelId:'p1',specialty:'tankCrew'},
 {instanceId:'a',slot:2,personnelId:'p2',specialty:'tankCrew'},
 {instanceId:'c',slot:1,personnelId:'p3',specialty:'tankCrew'},
];

describe('projectCanonicalUnit',()=>{
 it('projects only canonical records owned by the requested unit',()=>{
  expect(projectCanonicalUnit('u1',registry,instances,assignments,definitions)).toMatchObject({unitId:'u1',personnel:2,equipment:2,equipmentOperational:1,equipmentDamaged:1,equipmentDestroyed:0,equipmentMissing:0,crewRequired:5,crewReady:2,equipmentReady:0});
 });
 it('does not count personnel or assignments from another unit',()=>{
  expect(projectCanonicalUnit('u2',registry,instances,assignments,definitions)).toMatchObject({unitId:'u2',personnel:1,equipment:1,equipmentOperational:1,crewRequired:5,crewReady:1,equipmentReady:0});
 });
 it('does not mutate canonical inputs',()=>{
  const before=JSON.stringify({registry,instances,assignments}); projectCanonicalUnit('u1',registry,instances,assignments,definitions); expect(JSON.stringify({registry,instances,assignments})).toBe(before);
 });
});

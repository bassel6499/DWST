import { describe, expect, it } from 'vitest';
import { projectCanonicalUnitResources } from './canonicalUnitAdapter';
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

describe('projectCanonicalUnitResources',()=>{
 it('projects only UnitState resource fields',()=>{
  expect(projectCanonicalUnitResources('u1',registry,instances,assignments,definitions)).toEqual({personnel:2,equipment:2,readiness:0});
 });
 it('never mutates canonical inputs',()=>{
  const before=JSON.stringify({registry,instances,assignments,definitions});
  projectCanonicalUnitResources('u1',registry,instances,assignments,definitions);
  expect(JSON.stringify({registry,instances,assignments,definitions})).toBe(before);
 });
 it('returns zero readiness when a unit has no operational equipment',()=>{
  expect(projectCanonicalUnitResources('u3',registry,instances,assignments,definitions)).toEqual({personnel:0,equipment:0,readiness:0});
 });
});

import { describe, expect, it } from 'vitest';
import { projectCanonicalUnit } from './canonicalProjection';
import type { EquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';
import type { PersonnelRegistry } from './personnelRegistry';
import type { CanonicalConsumableState } from './canonicalConsumables';

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
const consumables:CanonicalConsumableState[]=[
 {unitId:'u1',ammunition:0.8,fuel:0.7},
 {unitId:'u2',ammunition:0.6,fuel:0.5},
];

describe('projectCanonicalUnit',()=>{
 it('projects only canonical records owned by the requested unit',()=>{
  expect(projectCanonicalUnit('u1',registry,instances,assignments,definitions,consumables)).toMatchObject({unitId:'u1',personnel:2,equipment:2,ammunition:0.8,fuel:0.7,equipmentOperational:1,equipmentDamaged:1,equipmentDestroyed:0,equipmentMissing:0,crewRequired:5,crewReady:2,equipmentReady:0});
 });
 it('does not count personnel or assignments from another unit',()=>{
  expect(projectCanonicalUnit('u2',registry,instances,assignments,definitions,consumables)).toMatchObject({unitId:'u2',personnel:1,equipment:1,ammunition:0.6,fuel:0.5,equipmentOperational:1,crewRequired:5,crewReady:1,equipmentReady:0});
 });
 it('does not mutate canonical inputs',()=>{
  const before=JSON.stringify({registry,instances,assignments,consumables}); projectCanonicalUnit('u1',registry,instances,assignments,definitions,consumables); expect(JSON.stringify({registry,instances,assignments,consumables})).toBe(before);
 });
 it('surfaces a missing equipment definition instead of silently under-counting readiness',()=>{
  expect(()=>projectCanonicalUnit('u1',registry,instances,assignments,[],consumables)).toThrow('Missing equipment definition tank for unit u1');
 });
 it('surfaces a missing crew requirement instead of silently under-counting readiness',()=>{
  const invalidDefinitions:EquipmentDefinition[]=[{id:'tank',name:'Tank',era:'WWII',equipmentType:'tank',crewRequirementId:'WWII:tank:missingCrew'}];
  expect(()=>projectCanonicalUnit('u1',registry,instances,assignments,invalidDefinitions,consumables)).toThrow();
 });
});

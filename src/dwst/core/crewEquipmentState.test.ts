import { describe, expect, it } from 'vitest';
import { projectInstanceEquipmentReadiness } from './crewEquipmentState';
import type { EquipmentDefinition } from './equipmentCatalog';
import type { EquipmentInstance } from './equipmentInstances';
import type { InstanceCrewAssignment } from './instanceCrewAssignments';
import type { PersonnelRegistry } from './personnelRegistry';

describe('projectInstanceEquipmentReadiness', () => {
 const definition:EquipmentDefinition={
  id:'modern-tank',
  name:'Modern Tank',
  era:'Modern',
  equipmentType:'tank',
  crewRequirementId:'Modern:tank:tankCrew',
 };
 const instance:EquipmentInstance={instanceId:'tank-1',definitionId:'modern-tank',status:'operational'};
 const registry:PersonnelRegistry={personnel:[
  {id:'p1',status:'assigned',qualifications:['tankCrew'],experience:{trained:1}},
  {id:'p2',status:'assigned',qualifications:['tankCrew'],experience:{trained:1}},
  {id:'p3',status:'assigned',qualifications:['tankCrew'],experience:{trained:1}},
  {id:'p4',status:'assigned',qualifications:['tankCrew'],experience:{trained:1}},
 ]};

 it('counts only personnel actually assigned to the requested instance',()=>{
  const assignments:InstanceCrewAssignment[]=[
   {instanceId:'tank-1',slot:1,personnelId:'p1',specialty:'tankCrew'},
   {instanceId:'tank-1',slot:2,personnelId:'p2',specialty:'tankCrew'},
   {instanceId:'tank-1',slot:3,personnelId:'p3',specialty:'tankCrew'},
   {instanceId:'tank-2',slot:1,personnelId:'p4',specialty:'tankCrew'},
  ];
  const result=projectInstanceEquipmentReadiness(instance,assignments,registry,definition);
  expect(result.crewReady).toBe(3);
  expect(result.crewShort).toBe(0);
  expect(result.usable).toBe(1);
 });

 it('does not make a damaged instance usable even with a complete crew',()=>{
  const damaged={...instance,status:'damaged' as const};
  const assignments:InstanceCrewAssignment[]=registry.personnel.slice(0,3).map((p,index)=>({
   instanceId:'tank-1',slot:index+1,personnelId:p.id,specialty:'tankCrew',
  }));
  const result=projectInstanceEquipmentReadiness(damaged,assignments,registry,definition);
  expect(result.crewReady).toBe(3);
  expect(result.usable).toBe(0);
 });

 it('does not count a qualified person assigned to another instance',()=>{
  const assignments:InstanceCrewAssignment[]=[
   {instanceId:'tank-1',slot:1,personnelId:'p1',specialty:'tankCrew'},
   {instanceId:'tank-1',slot:2,personnelId:'p2',specialty:'tankCrew'},
   {instanceId:'tank-2',slot:1,personnelId:'p3',specialty:'tankCrew'},
  ];
  const result=projectInstanceEquipmentReadiness(instance,assignments,registry,definition);
  expect(result.crewReady).toBe(2);
  expect(result.crewShort).toBe(1);
  expect(result.usable).toBe(0);
 });
});

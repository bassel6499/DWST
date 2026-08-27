import { strict as assert } from 'node:assert';
import { projectEquipmentPoolReadiness } from './equipmentReadiness';

const defs:any=[
 {id:'tank',name:'WWII Tank',era:'WWII',equipmentType:'tank',crewRequirementId:'WWII:tank:tankCrew'},
 {id:'at',name:'WWII AT Gun',era:'WWII',equipmentType:'atGun',crewRequirementId:'WWII:atGun:atGunCrew'},
 {id:'arty',name:'WWII Artillery',era:'WWII',equipmentType:'artillery',crewRequirementId:'WWII:artillery:artilleryCrew'},
];
const instances:any=[
 ...Array.from({length:2},(_,i)=>({instanceId:`tank-${i+1}`,definitionId:'tank',status:'operational'})),
 {instanceId:'at-1',definitionId:'at',status:'operational'},
 {instanceId:'arty-1',definitionId:'arty',status:'operational'},
];
const personnel:any=[];
for(let i=1;i<=19;i++) personnel.push({id:`T${i}`,status:'assigned',qualifications:['tankCrew'],experience:{}});
for(let i=1;i<=6;i++) personnel.push({id:`A${i}`,status:'assigned',qualifications:['atGunCrew'],experience:{}});
for(let i=1;i<=8;i++) personnel.push({id:`R${i}`,status:'assigned',qualifications:['artilleryCrew'],experience:{}});
const assignments:any=[];
for(let i=1;i<=10;i++) assignments.push({instanceId:'tank-1',slot:i,personnelId:`T${i}`,specialty:'tankCrew'});
for(let i=11;i<=15;i++) assignments.push({instanceId:'tank-2',slot:i-10,personnelId:`T${i}`,specialty:'tankCrew'});
for(let i=1;i<=6;i++) assignments.push({instanceId:'at-1',slot:i,personnelId:`A${i}`,specialty:'atGunCrew'});
for(let i=1;i<=8;i++) assignments.push({instanceId:'arty-1',slot:i,personnelId:`R${i}`,specialty:'artilleryCrew'});
assert.deepEqual(projectEquipmentPoolReadiness(defs[0],instances,assignments,{personnel}),{definitionId:'tank',operational:2,crewReady:1,combatReady:1,uncrewed:1});
assert.deepEqual(projectEquipmentPoolReadiness(defs[1],instances,assignments,{personnel}),{definitionId:'at',operational:1,crewReady:1,combatReady:1,uncrewed:0});
assert.deepEqual(projectEquipmentPoolReadiness(defs[2],instances,assignments,{personnel}),{definitionId:'arty',operational:1,crewReady:1,combatReady:1,uncrewed:0});

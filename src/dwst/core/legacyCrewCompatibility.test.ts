import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { crewRequirement, usableEquipment } from './crews';

describe('legacy crew compatibility',()=>{
 const equipment:any={type:'tank',operational:10};
 const crews:any=[{specialty:'tankCrew',trained:20,ready:20,training:0,casualties:0}];
 it('preserves legacy crew calculations',()=>{
  assert.equal(usableEquipment(equipment,crews),4);
  const shortage:any=[{specialty:'tankCrew',trained:19,ready:19,training:0,casualties:1}];
  assert.equal(usableEquipment(equipment,shortage),3);
  assert.equal(crewRequirement.tankCrew,5);
  assert.equal(crewRequirement.atGunCrew,6);
  assert.equal(crewRequirement.artilleryCrew,8);
 });
});

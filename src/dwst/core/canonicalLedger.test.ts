import { describe, expect, it } from 'vitest';
import { validateLedger, usableSystems, type CanonicalResourceLedger, type EquipmentLedger } from './canonicalLedger';

describe('canonical resource ledger',()=>{
 it('balances personnel and equipment',()=>{
  const l:CanonicalResourceLedger={personnel:{total:100,available:40,assigned:40,training:10,wounded:5,missing:5,killed:0},specialists:[],equipment:[{type:'tank',designation:'Tank A',total:10,operational:8,damaged:1,destroyed:1,assigned:7}],links:[]};
  expect(validateLedger(l)).toEqual([]);
 });
 it('rejects unbalanced equipment',()=>{
  const l:CanonicalResourceLedger={personnel:{total:0,available:0,assigned:0,training:0,wounded:0,missing:0,killed:0},specialists:[],equipment:[{type:'tank',designation:'Tank A',total:10,operational:8,damaged:0,destroyed:0,assigned:0}],links:[]};
  expect(validateLedger(l).some(x=>x.includes('Equipment ledger'))).toBe(true);
 });
 it('caps systems by qualified crews',()=>{
  const e:EquipmentLedger={type:'tank',designation:'Tank A',total:20,operational:20,damaged:0,destroyed:0,assigned:0};
  const link={equipmentId:'tank-a',crewSpecialty:'tankCrew' as const,personnelPerSystem:5,requiredQualifiedCrew:5};
  const crews=[{specialty:'tankCrew' as const,personnel:15,qualified:10,training:5,casualties:0,veteran:2,experienced:3,trained:5}];
  expect(usableSystems(e,link,crews)).toBe(2);
 });
});

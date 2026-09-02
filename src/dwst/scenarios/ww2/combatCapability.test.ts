import { describe, expect, it } from 'vitest';
import { calculateForceCapability } from './combatCapability';
import type { CombatUnitContext } from '../../core/combatContext';

const context = (equipmentByDefinition:Record<string,number>, personnel=1000):CombatUnitContext => ({
  personnel,
  equipmentOperational:Object.values(equipmentByDefinition).reduce((a,b)=>a+b,0),
  equipmentDamaged:0,
  equipmentDestroyed:0,
  equipmentMissing:0,
  crewRequired:0,
  crewReady:0,
  equipmentReady:Object.values(equipmentByDefinition).reduce((a,b)=>a+b,0),
  equipmentByType:{tank:Object.values(equipmentByDefinition).reduce((a,b)=>a+b,0)},
  equipmentByDefinition,
  operationalEquipmentByDefinition:equipmentByDefinition,
});

describe('WW2 canonical equipment capability',()=>{
  it('distinguishes canonical equipment definitions instead of treating all tanks identically',()=>{
    const panther=calculateForceCapability(context({'ww2-panther':10}));
    const tiger=calculateForceCapability(context({'ww2-tiger-ii':10}));
    const stuart=calculateForceCapability(context({'us-m5-stuart':10}));
    expect(tiger.armor).toBeGreaterThan(panther.armor);
    expect(panther.armor).toBeGreaterThan(stuart.armor);
    expect(tiger.antiArmor).toBeGreaterThan(panther.antiArmor);
    expect(panther.antiArmor).toBeGreaterThan(stuart.antiArmor);
  });

  it('keeps infantry formations combat-capable when they have no equipment instances',()=>{
    const capability=calculateForceCapability(context({},12000));
    expect(capability.infantry).toBe(1);
    expect(capability.armor).toBe(0);
    expect(capability.antiArmor).toBe(0);
  });

  it('uses operational equipment only for definition-level capability',()=>{
    const capability=calculateForceCapability({
      ...context({'ww2-tiger-ii':10,'ww2-pziv':10}),
      equipmentOperational:10,
      equipmentByType:{tank:20},
      operationalEquipmentByDefinition:{'ww2-tiger-ii':10},
    });
    expect(capability.armor).toBe(0.95);
  });
});

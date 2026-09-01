import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { advanceCanonicalSimulation, startCanonicalSimulation } from '@/dwst';
import { demoCanonical, demoScenario } from './demoCanonicalFixture';

const policy = {
  personnelDisposition: 'killed' as const,
  equipmentDisposition: 'destroyed' as const,
  eligiblePersonnelStatuses: ['assigned' as const],
  eligibleEquipmentStatuses: ['operational' as const],
  selection: 'stable-id' as const,
};

describe('canonical demo fixture', () => {
  it('starts without orphaned definitions or missing canonical coverage', () => {
    const session = startCanonicalSimulation(demoScenario, demoCanonical);

    assert.equal(demoCanonical.equipmentDefinitions.length, 1);
    assert.equal(demoCanonical.equipmentDefinitions[0]?.id, 'demo-equipment');
    assert.equal(demoCanonical.crewAssignments.length, 200);
    assert.equal(demoCanonical.consumables.length, 4);

    for (const unit of Object.values(session.state.units)) {
      assert.equal(unit.personnel, 100);
      assert.equal(unit.equipment, 10);
      assert.equal(unit.ammunition, 0.85);
      assert.equal(unit.fuel, 0.85);
    }
  });

  it('can advance one turn through the canonical session', () => {
    const session = startCanonicalSimulation(demoScenario, demoCanonical);
    const result = advanceCanonicalSimulation(session, policy);

    assert.equal(result.session.state.elapsedHours, 6);
    assert.equal(result.session.provenance.modelVersion, 'dwst-core-v1');
  });
});

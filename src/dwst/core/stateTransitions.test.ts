import { strict as assert } from 'node:assert';
import { applyResourceOperations } from './stateTransitions';

const base={
 personnel:{total:3,available:1,assigned:1,training:1,wounded:0,missing:0,killed:0},
 specialists:[{specialty:'tankCrew' as any,personnelIds:['P2','P3'],personnel:2,qualified:1,training:1,casualties:0,veteran:0,experienced:0,trained:1}],
 equipment:[{type:'tank' as any,designation:'Tank 1',total:1,operational:1,damaged:0,destroyed:0,assigned:0}],
 links:[{equipmentId:'Tank 1',crewSpecialty:'tankCrew' as any,requiredQualifiedCrew:1}]
};

const failed=applyResourceOperations(base,[{kind:'damageEquipment',equipmentId:'Tank 1',amount:2},{kind:'damageEquipment',equipmentId:'missing',amount:1}]);
assert.equal(failed.errors.length,1);
assert.equal(failed.ledger.equipment[0].operational,1);

const damaged=applyResourceOperations(base,[{kind:'damageEquipment',equipmentId:'Tank 1',amount:1}]);
assert.equal(damaged.errors.length,0);
assert.equal(damaged.ledger.equipment[0].operational,0);
assert.equal(damaged.ledger.equipment[0].damaged,1);

const trained=applyResourceOperations(base,[{kind:'completeTraining',personnelId:'P3',specialty:'tankCrew' as any}]);
assert.equal(trained.errors.length,0);
assert.equal(trained.ledger.specialists[0].qualified,2);
assert.equal(trained.ledger.specialists[0].training,0);

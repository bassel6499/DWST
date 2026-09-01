import type { CanonicalState } from '../core/canonicalState';
import type { EquipmentDefinition } from '../core/equipmentCatalog';
import type { EquipmentInstance } from '../core/equipmentInstances';
import type { InstanceCrewAssignment } from '../core/instanceCrewAssignments';
import type { PersonnelRecord } from '../core/personnelRegistry';
import type { CanonicalConsumableState } from '../core/canonicalConsumables';

const TANK_CREW = 'tankCrew';
const TANK_REQUIREMENT = 'WWII:tank:tankCrew';

const definitions: EquipmentDefinition[] = [
  { id: 'ww2-pziv', name: 'Panzer IV', era: 'WWII', equipmentType: 'tank', crewRequirementId: TANK_REQUIREMENT },
  { id: 'ww2-panther', name: 'Panther', era: 'WWII', equipmentType: 'tank', crewRequirementId: TANK_REQUIREMENT },
  { id: 'ww2-tiger-ii', name: 'Tiger II', era: 'WWII', equipmentType: 'tank', crewRequirementId: TANK_REQUIREMENT },
  { id: 'ww2-stug-iii', name: 'StuG III', era: 'WWII', equipmentType: 'tank', crewRequirementId: TANK_REQUIREMENT },
  { id: 'ww2-jagdpanzer-iv70', name: 'Jagdpanzer IV/70', era: 'WWII', equipmentType: 'tank', crewRequirementId: TANK_REQUIREMENT },
  { id: 'us-m4-sherman', name: 'M4 Sherman', era: 'WWII', equipmentType: 'tank', crewRequirementId: TANK_REQUIREMENT },
  { id: 'us-m5-stuart', name: 'M5 Stuart', era: 'WWII', equipmentType: 'tank', crewRequirementId: TANK_REQUIREMENT },
];

interface FormationResourcePlan {
  unitId: string;
  personnel: number;
  equipment: Array<{ definitionId: string; count: number }>;
  ammunition: number;
  fuel: number;
}

/*
 * Deterministic historical starting-resource selections for 16 Dec 1944.
 * Ranges found in the literature are resolved here to one reproducible value;
 * the scenario never stores a personnel/equipment aggregate as authoritative
 * state. The generated records below are the canonical resource state.
 *
 * Key evidence used for the selections:
 * - Cole/US Army history: 1 SS Panzer Division ~100 Pz IV/Panther + 42 Tigers;
 *   2 Panzer Division 27 Pz IV + 58 Panthers + 48 assault guns.
 * - Panzer Lehr: 14,892 personnel, 27 Pz IV, 30 Panthers, 20 Jagdpanzer IV/70.
 * - 26 VGD: 9,951 divisional personnel, separating attached ration-strength assets.
 * - 18/62 VGD: approximately 10,000 each, consistent with the 1944 VGD structure.
 * - 101st Airborne: 805 officers + 11,035 enlisted = 11,840.
 * - 7th Armored: best-supported operational estimate 14,000 personnel and
 *   256 tanks on 16 Dec (174 Shermans, 82 Stuarts).
 *
 * The current engine has only a generic WWII tank crew requirement, so assault
 * guns/tank destroyers are represented by explicit equipment definitions using
 * that generic crew contract rather than being silently dropped.
 */
const resourcePlans: FormationResourcePlan[] = [
  { unitId: 'g-1ss', personnel: 21000, equipment: [
    { definitionId: 'ww2-pziv', count: 50 },
    { definitionId: 'ww2-panther', count: 50 },
    { definitionId: 'ww2-tiger-ii', count: 42 },
  ], ammunition: 0.86, fuel: 0.72 },
  { unitId: 'g-12ss', personnel: 20000, equipment: [
    { definitionId: 'ww2-pziv', count: 37 },
    { definitionId: 'ww2-panther', count: 38 },
  ], ammunition: 0.84, fuel: 0.70 },
  { unitId: 'g-2pd', personnel: 14400, equipment: [
    { definitionId: 'ww2-pziv', count: 27 },
    { definitionId: 'ww2-panther', count: 58 },
    { definitionId: 'ww2-stug-iii', count: 48 },
  ], ammunition: 0.84, fuel: 0.74 },
  { unitId: 'g-pl', personnel: 14892, equipment: [
    { definitionId: 'ww2-pziv', count: 27 },
    { definitionId: 'ww2-panther', count: 30 },
    { definitionId: 'ww2-jagdpanzer-iv70', count: 20 },
  ], ammunition: 0.82, fuel: 0.70 },
  { unitId: 'g-26vgd', personnel: 9951, equipment: [], ammunition: 0.68, fuel: 0.60 },
  { unitId: 'g-18vgd', personnel: 10000, equipment: [], ammunition: 0.70, fuel: 0.62 },
  { unitId: 'g-62vgd', personnel: 10000, equipment: [], ammunition: 0.70, fuel: 0.62 },
  { unitId: 'a-101ab', personnel: 11840, equipment: [], ammunition: 0.82, fuel: 0.78 },
  { unitId: 'a-7ad', personnel: 14000, equipment: [
    { definitionId: 'us-m4-sherman', count: 174 },
    { definitionId: 'us-m5-stuart', count: 82 },
  ], ammunition: 0.78, fuel: 0.76 },
];

const personnel: PersonnelRecord[] = [];
const equipment: EquipmentInstance[] = [];
const crewAssignments: InstanceCrewAssignment[] = [];

for (const plan of resourcePlans) {
  for (let index = 0; index < plan.personnel; index += 1) {
    personnel.push({
      id: `${plan.unitId}-personnel-${index + 1}`,
      unitId: plan.unitId,
      status: 'assigned',
      qualifications: [],
      experience: index < Math.ceil(plan.personnel * 0.08) ? { veteran: 1 } : { experienced: 1 },
    });
  }

  let personnelCursor = 0;
  for (const equipmentPlan of plan.equipment) {
    for (let index = 0; index < equipmentPlan.count; index += 1) {
      const instanceId = `${plan.unitId}-${equipmentPlan.definitionId}-${index + 1}`;
      equipment.push({
        instanceId,
        definitionId: equipmentPlan.definitionId,
        unitId: plan.unitId,
        status: 'operational',
      });
      for (let slot = 1; slot <= 5; slot += 1) {
        const person = personnel.find((record) => record.id === `${plan.unitId}-personnel-${personnelCursor + 1}`);
        if (!person) throw new Error(`Canonical Ardennes crew allocation overflow for ${plan.unitId}`);
        person.qualifications = [TANK_CREW];
        crewAssignments.push({
          instanceId,
          slot,
          personnelId: person.id,
          specialty: TANK_CREW,
        });
        personnelCursor += 1;
      }
    }
  }
}

const consumables: CanonicalConsumableState[] = resourcePlans.map((plan) => ({
  unitId: plan.unitId,
  ammunition: plan.ammunition,
  fuel: plan.fuel,
}));

export const ardennes1944Canonical: CanonicalState = {
  personnel: { personnel },
  equipment,
  crewAssignments,
  equipmentDefinitions: definitions,
  consumables,
};

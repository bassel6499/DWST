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
 * These plans are construction inputs only: the authoritative simulation state
 * is the generated individual personnel/equipment/crew records below.
 * Ranges found in historical records are resolved to one reproducible value.
 *
 * High-confidence formation-specific figures are preferred where available.
 * Examples include Cole/US Army figures for 1 SS, 2 Panzer and Panzer Lehr,
 * the documented 26 VGD divisional strength, and the 101st/7th Armored figures.
 * For formations whose surviving records do not give a clean same-day total,
 * a single conservative best estimate is used rather than storing a range.
 *
 * The current engine has only a generic WWII tank crew requirement, so assault
 * guns/tank destroyers are represented by explicit equipment definitions using
 * that generic crew contract rather than being silently dropped.
 */
const resourcePlans: FormationResourcePlan[] = [
  // German 6th Panzer Army / northern shoulder.
  { unitId: 'g-1ss', personnel: 21000, equipment: [
    { definitionId: 'ww2-pziv', count: 50 },
    { definitionId: 'ww2-panther', count: 50 },
    { definitionId: 'ww2-tiger-ii', count: 42 },
  ], ammunition: 0.86, fuel: 0.72 },
  { unitId: 'g-12ss', personnel: 20000, equipment: [
    { definitionId: 'ww2-pziv', count: 37 },
    { definitionId: 'ww2-panther', count: 38 },
  ], ammunition: 0.84, fuel: 0.70 },
  { unitId: 'g-3fj', personnel: 12000, equipment: [], ammunition: 0.74, fuel: 0.60 },
  { unitId: 'g-326vgd', personnel: 12000, equipment: [], ammunition: 0.68, fuel: 0.58 },
  { unitId: 'g-277vgd', personnel: 11000, equipment: [], ammunition: 0.68, fuel: 0.58 },

  // German 5th Panzer Army / central sector.
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
  { unitId: 'g-116pd', personnel: 15000, equipment: [], ammunition: 0.74, fuel: 0.64 },
  { unitId: 'g-560vgd', personnel: 10000, equipment: [], ammunition: 0.66, fuel: 0.58 },

  // German 7th Army / southern sector.
  { unitId: 'g-5fj', personnel: 11000, equipment: [], ammunition: 0.70, fuel: 0.58 },
  { unitId: 'g-352vgd', personnel: 12000, equipment: [], ammunition: 0.68, fuel: 0.58 },
  { unitId: 'g-212vgd', personnel: 10000, equipment: [], ammunition: 0.66, fuel: 0.56 },
  { unitId: 'g-276vgd', personnel: 10000, equipment: [], ammunition: 0.66, fuel: 0.56 },

  // U.S. V Corps / northern shoulder. Strength estimates are fixed single
  // values for determinism; the simulation does not store ranges.
  { unitId: 'a-99id', personnel: 13725, equipment: [], ammunition: 0.82, fuel: 0.78 },
  { unitId: 'a-2id', personnel: 14000, equipment: [], ammunition: 0.84, fuel: 0.80 },

  // U.S. VIII Corps / central and southern sectors.
  { unitId: 'a-106id', personnel: 14000, equipment: [], ammunition: 0.80, fuel: 0.76 },
  { unitId: 'a-28id', personnel: 13400, equipment: [], ammunition: 0.82, fuel: 0.76 },
  { unitId: 'a-9ad', personnel: 15000, equipment: [
    { definitionId: 'us-m4-sherman', count: 170 },
    { definitionId: 'us-m5-stuart', count: 34 },
  ], ammunition: 0.78, fuel: 0.74 },
  { unitId: 'a-4id', personnel: 14000, equipment: [], ammunition: 0.82, fuel: 0.76 },

  // Reinforcements/reserves. These exist canonically but begin off the opening
  // line and are moved by the scenario orders/events.
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
  const personnelById = new Map<string, PersonnelRecord>();
  for (let index = 0; index < plan.personnel; index += 1) {
    const record: PersonnelRecord = {
      id: `${plan.unitId}-personnel-${index + 1}`,
      unitId: plan.unitId,
      status: 'assigned',
      qualifications: [],
      experience: index < Math.ceil(plan.personnel * 0.08) ? { veteran: 1 } : { experienced: 1 },
    };
    personnel.push(record);
    personnelById.set(record.id, record);
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
        const person = personnelById.get(`${plan.unitId}-personnel-${personnelCursor + 1}`);
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

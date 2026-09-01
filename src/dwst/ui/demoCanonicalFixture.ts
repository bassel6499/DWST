import type {
  CanonicalState,
  ScenarioState,
  UnitState,
} from '@/dwst';
import { ardennes1944 } from '@/dwst/scenarios/ardennes1944';

const DEMO_EQUIPMENT_DEFINITION_ID = 'demo-equipment';
const DEMO_EQUIPMENT_CREW_SPECIALTY = 'tankCrew';
const DEMO_EQUIPMENT_CREW_REQUIREMENT_ID = 'WWII:tank:tankCrew';

const makeUnit = (
  id: string,
  name: string,
  side: UnitState['side'],
  lon: number,
  lat: number,
): UnitState => ({
  id,
  name,
  side,
  echelon: 'division',
  personnel: 100,
  equipment: 10,
  ammunition: 0.85,
  fuel: 0.85,
  readiness: 0.9,
  training: 0.85,
  experience: 0.75,
  morale: 0.85,
  cohesion: 0.85,
  fatigue: 0.1,
  wear: 0.05,
  logistics: 0.9,
  commandQuality: 0.85,
  intelligence: 0.7,
  combatPower: 1,
  status: 'operational',
  position: { lon, lat },
  cumulativeLosses: 0,
  history: [],
});

export const demoScenario: ScenarioState = {
  id: 'ardennes-1944-demo',
  name: 'Ardennes 1944 — Operational Prototype',
  era: 'ww2',
  scale: 'operational',
  turnHours: 6,
  elapsedHours: 0,
  weather: 1,
  terrain: 1,
  intelLevel: 0.7,
  units: {
    'de-2pz': makeUnit('de-2pz', '2nd Panzer Division', 'enemy', 5.8, 50.05),
    'de-pzlehr': makeUnit('de-pzlehr', 'Panzer Lehr Division', 'enemy', 5.9, 49.95),
    'us-101': makeUnit('us-101', '101st Airborne Division', 'allied', 5.72, 50.0),
    'us-4arm': makeUnit('us-4arm', '4th Armored Division', 'allied', 5.55, 49.85),
  },
  events: [],
  locations: ardennes1944.locations,
};

/**
 * Canonical demo resources. These are deliberately small synthetic records
 * used to exercise the canonical resource pipeline. The historical Ardennes
 * scenario remains a separate scenario data source and is not rewritten here.
 */
export const demoCanonical: CanonicalState = {
  personnel: {
    personnel: Object.values(demoScenario.units).flatMap((unit) =>
      Array.from({ length: unit.personnel }, (_, index) => ({
        id: `${unit.id}-p-${index}`,
        unitId: unit.id,
        status: 'assigned' as const,
        qualifications: index < unit.equipment * 5 ? [DEMO_EQUIPMENT_CREW_SPECIALTY] : [],
        experience: index < unit.equipment * 5 ? { trained: 1 } : {},
      })),
    ),
  },
  equipment: Object.values(demoScenario.units).flatMap((unit) =>
    Array.from({ length: unit.equipment }, (_, index) => ({
      instanceId: `${unit.id}-e-${index}`,
      definitionId: DEMO_EQUIPMENT_DEFINITION_ID,
      unitId: unit.id,
      status: 'operational' as const,
    })),
  ),
  crewAssignments: Object.values(demoScenario.units).flatMap((unit) =>
    Array.from({ length: unit.equipment }, (_, equipmentIndex) =>
      Array.from({ length: 5 }, (_, slotIndex) => ({
        instanceId: `${unit.id}-e-${equipmentIndex}`,
        slot: slotIndex + 1,
        personnelId: `${unit.id}-p-${equipmentIndex * 5 + slotIndex}`,
        specialty: DEMO_EQUIPMENT_CREW_SPECIALTY,
      })),
    ).flat(),
  ),
  equipmentDefinitions: [{
    id: DEMO_EQUIPMENT_DEFINITION_ID,
    name: 'WWII Demo Tank',
    era: 'WWII',
    equipmentType: 'tank',
    crewRequirementId: DEMO_EQUIPMENT_CREW_REQUIREMENT_ID,
  }],
  consumables: Object.values(demoScenario.units).map((unit) => ({
    unitId: unit.id,
    ammunition: unit.ammunition,
    fuel: unit.fuel,
  })),
};

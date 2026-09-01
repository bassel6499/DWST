import { bench, beforeEach, describe } from 'vitest';
import type { CanonicalState } from './canonicalState';
import type { ScenarioState, UnitState } from './types';
import { advanceCanonicalSimulation, startCanonicalSimulation } from './canonicalSimulationSession';
import type { CombatAllocationPolicy } from './canonicalCombatAllocation';

const TURN_COUNT = 20;
const UNIT_COUNT = 20;
const PERSONNEL_PER_UNIT = 20;
const EQUIPMENT_PER_UNIT = 10;

const policy: CombatAllocationPolicy = {
  personnelDisposition: 'killed',
  equipmentDisposition: 'destroyed',
  eligiblePersonnelStatuses: ['assigned'],
  eligibleEquipmentStatuses: ['operational'],
  selection: 'stable-id',
};

const unit = (id: string, side: UnitState['side'], index: number): UnitState => ({
  id,
  name: `Benchmark Unit ${index + 1}`,
  side,
  echelon: 'battalion',
  personnel: PERSONNEL_PER_UNIT,
  equipment: EQUIPMENT_PER_UNIT,
  ammunition: 100,
  fuel: 100,
  readiness: 1,
  training: 1,
  experience: 1,
  morale: 1,
  cohesion: 1,
  fatigue: 0,
  wear: 0,
  logistics: 1,
  commandQuality: 1,
  intelligence: 1,
  combatPower: 100,
  status: 'operational',
  position: { lat: 50 + index * 0.01, lon: 6 + index * 0.01 },
  cumulativeLosses: 0,
  history: [],
  order: { type: 'attack' },
});

const scenario = (): ScenarioState => ({
  id: 'canonical-performance-benchmark',
  name: 'Canonical performance benchmark',
  era: 'ww2',
  scale: 'operational',
  turnHours: 6,
  elapsedHours: 0,
  weather: 0,
  terrain: 0,
  intelLevel: 1,
  units: Object.fromEntries(
    Array.from({ length: UNIT_COUNT }, (_, index) => {
      const id = `bench-${String(index + 1).padStart(3, '0')}`;
      return [id, unit(id, index % 2 === 0 ? 'allied' : 'enemy', index)];
    }),
  ),
  events: [],
});

const canonical = (): CanonicalState => ({
  personnel: {
    personnel: Array.from({ length: UNIT_COUNT }, (_, unitIndex) =>
      Array.from({ length: PERSONNEL_PER_UNIT }, (_, personIndex) => ({
        id: `p-${String(unitIndex + 1).padStart(3, '0')}-${String(personIndex + 1).padStart(3, '0')}`,
        unitId: `bench-${String(unitIndex + 1).padStart(3, '0')}`,
        status: 'assigned' as const,
        qualifications: [],
        experience: {},
      })),
    ).flat(),
  },
  equipment: Array.from({ length: UNIT_COUNT }, (_, unitIndex) =>
    Array.from({ length: EQUIPMENT_PER_UNIT }, (_, equipmentIndex) => ({
      instanceId: `e-${String(unitIndex + 1).padStart(3, '0')}-${String(equipmentIndex + 1).padStart(3, '0')}`,
      definitionId: 'benchmark-equipment',
      unitId: `bench-${String(unitIndex + 1).padStart(3, '0')}`,
      status: 'operational' as const,
    })),
  ).flat(),
  crewAssignments: [],
  equipmentDefinitions: [{
    id: 'benchmark-equipment',
    name: 'Benchmark equipment',
    era: 'WWII',
    equipmentType: 'tank',
    crewRequirementId: 'WWII:tank:tankCrew',
  }],
  consumables: Array.from({ length: UNIT_COUNT }, (_, unitIndex) => ({
    unitId: `bench-${String(unitIndex + 1).padStart(3, '0')}`,
    ammunition: 100,
    fuel: 100,
  })),
});

let preparedSession = startCanonicalSimulation(scenario(), canonical());

beforeEach(() => {
  preparedSession = startCanonicalSimulation(scenario(), canonical());
});

describe('canonical simulation performance profile', () => {
  bench(`start canonical simulation (${UNIT_COUNT} units)`, () => {
    startCanonicalSimulation(scenario(), canonical());
  }, { warmupIterations: 3 });

  bench(`advance one canonical turn (${UNIT_COUNT} units)`, () => {
    const result = advanceCanonicalSimulation(preparedSession, policy);
    if (result.report.turn !== 1) throw new Error(`Expected turn 1, got ${result.report.turn}`);
  }, { warmupIterations: 3 });

  bench(`advance ${TURN_COUNT} canonical turns (${UNIT_COUNT} units)`, () => {
    let session = preparedSession;
    for (let turn = 0; turn < TURN_COUNT; turn += 1) {
      const result = advanceCanonicalSimulation(session, policy);
      if (result.report.turn !== turn + 1) {
        throw new Error(`Expected turn ${turn + 1}, got ${result.report.turn}`);
      }
      session = result.session;
    }
  }, { warmupIterations: 3 });
});

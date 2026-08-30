<script setup lang="ts">
import { computed, ref } from 'vue';
import DwstCommandPanel from './DwstCommandPanel.vue';
import {
  advanceCanonicalSimulation,
  startCanonicalSimulation,
  resolveOrderDestination,
  type CanonicalState,
  type CombatAllocationPolicy,
  type Order,
  type UnitState,
} from '@/dwst';
import { ardennes1944 } from '@/dwst/scenarios/ardennes1944';

const policy: CombatAllocationPolicy = {
  personnelDisposition: 'killed',
  equipmentDisposition: 'destroyed',
  eligiblePersonnelStatuses: ['assigned'],
  eligibleEquipmentStatuses: ['operational'],
  selection: 'stable-id',
};

const makeUnit = (id: string, name: string, side: UnitState['side'], lon: number, lat: number): UnitState => ({
  id, name, side, echelon: 'division', personnel: 10000, equipment: 250, ammunition: 0.85, fuel: 0.85,
  readiness: 0.9, training: 0.85, experience: 0.75, morale: 0.85, cohesion: 0.85, fatigue: 0.1,
  wear: 0.05, logistics: 0.9, commandQuality: 0.85, intelligence: 0.7, combatPower: 1,
  status: 'operational', position: { lon, lat }, cumulativeLosses: 0, history: [],
});

const scenario = {
  id: 'ardennes-1944-demo', name: 'Ardennes 1944 — Operational Prototype', era: 'ww2' as const, scale: 'operational' as const, turnHours: 6,
  elapsedHours: 0, weather: 1, terrain: 1, intelLevel: 0.7,
  units: {
    'de-2pz': makeUnit('de-2pz', '2nd Panzer Division', 'enemy', 5.8, 50.05),
    'de-pzlehr': makeUnit('de-pzlehr', 'Panzer Lehr Division', 'enemy', 5.9, 49.95),
    'us-101': makeUnit('us-101', '101st Airborne Division', 'allied', 5.72, 50.0),
    'us-4arm': makeUnit('us-4arm', '4th Armored Division', 'allied', 5.55, 49.85),
  }, events: [], locations: ardennes1944.locations,
};

const canonical: CanonicalState = {
  personnel: {
    personnel: Object.values(scenario.units).flatMap((unit) => Array.from({ length: unit.personnel }, (_, index) => ({
      id: `${unit.id}-p-${index}`,
      unitId: unit.id,
      status: 'assigned' as const,
      qualifications: [],
      experience: {},
    }))),
  },
  equipment: Object.values(scenario.units).flatMap((unit) => Array.from({ length: unit.equipment }, (_, index) => ({
    instanceId: `${unit.id}-e-${index}`,
    definitionId: 'demo-equipment',
    unitId: unit.id,
    status: 'operational' as const,
  }))),
  crewAssignments: [],
  equipmentDefinitions: [],
  consumables: Object.values(scenario.units).map((unit) => ({
    unitId: unit.id,
    ammunition: unit.ammunition,
    fuel: unit.fuel,
  })),
};

const session = ref(startCanonicalSimulation(scenario, canonical));
const state = computed(() => session.value.state);
const units = computed(() => Object.values(state.value.units));
const report = ref<string[]>(['Scenario initialized. Issue an order to begin.']);
const currentTurn = computed(() => Math.floor(state.value.elapsedHours / state.value.turnHours) + 1);

function issueOrder(unitId: string, order: Order) {
  const unit = state.value.units[unitId];
  if (!unit) return;
  const resolvedOrder = resolveOrderDestination(state.value, order);
  if (resolvedOrder.objective && !resolvedOrder.destination && resolvedOrder.type === 'move') {
    report.value.unshift(`${unit.name}: objective "${resolvedOrder.objective}" could not be resolved in this scenario; order not issued.`);
    return;
  }
  session.value = {
    ...session.value,
    state: {
      ...state.value,
      units: {
        ...state.value.units,
        [unitId]: { ...unit, order: resolvedOrder },
      },
    },
  };
  report.value.unshift(`${unit.name}: ${resolvedOrder.type.toUpperCase()}${resolvedOrder.objective ? ` → ${resolvedOrder.objective}` : ''}${resolvedOrder.destination ? ' [destination resolved]' : ''} (${resolvedOrder.posture ?? 'normal'}).`);
}

function setTurnHours(turnHours: number) {
  session.value = {
    ...session.value,
    state: { ...state.value, turnHours },
  };
}

function advance() {
  const result = advanceCanonicalSimulation(session.value, policy);
  session.value = result.session;
  const combatEvents = result.report.events.filter(event => event.phase === 'combat');
  report.value.unshift(
    `Turn ${result.report.turn} complete. ${result.report.elapsedHours} hours elapsed. ` +
    `Movement, ${combatEvents.length} combat event(s), readiness, fatigue and logistics resolved by the selected era ruleset.`
  );
}
</script>

<template>
  <main class="dwst-demo">
    <div class="topbar"><div><h1>DWST</h1><span>Ardennes 1944 · Operational Prototype</span></div><strong>TURN {{ currentTurn }}</strong></div>
    <div class="layout">
      <DwstCommandPanel :units="units" :turn-hours="state.turnHours" @order="issueOrder" @update:turn-hours="setTurnHours" @advance="advance" />
      <section class="situation">
        <h2>Force Status</h2>
        <article v-for="unit in units" :key="unit.id" class="unit" :class="unit.side">
          <div><b>{{ unit.name }}</b><small>{{ unit.side }} · {{ unit.status }}</small></div>
          <div class="stats">Personnel {{ unit.personnel.toLocaleString() }} · Ammo {{ Math.round(unit.ammunition*100) }}% · Fuel {{ Math.round(unit.fuel*100) }}% · Fatigue {{ Math.round(unit.fatigue*100) }}%</div>
          <div v-if="unit.order" class="order">ORDER: {{ unit.order.type }} {{ unit.order.objective ? `→ ${unit.order.objective}` : '' }}{{ unit.order.destination ? ' [resolved]' : '' }}</div>
        </article>
        <h2>SITREP</h2>
        <div class="sitrep"><p v-for="(line, i) in report" :key="i">{{ line }}</p></div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.dwst-demo { min-height:100vh; padding:16px; box-sizing:border-box; font:14px system-ui,sans-serif; background:#eef0f2; color:#151515; }
.topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; } h1 { margin:0; } .topbar span { opacity:.65; } .layout { display:grid; grid-template-columns:minmax(280px,420px) 1fr; gap:16px; max-width:1200px; margin:auto; }
.situation { background:#fff; padding:16px; border-radius:8px; } h2 { margin:0 0 10px; } .unit { padding:10px; margin-bottom:8px; border:1px solid #ccc; border-radius:6px; } .unit small { display:block; opacity:.65; margin-top:3px; } .unit.allied { border-left:4px solid #2672b8; } .unit.enemy { border-left:4px solid #a33; } .stats { margin-top:8px; font-size:12px; } .order { margin-top:6px; font-size:12px; font-weight:700; } .sitrep { max-height:280px; overflow:auto; background:#f5f5f5; padding:8px 12px; } .sitrep p { margin:6px 0; }
@media (max-width:760px) { .layout { grid-template-columns:1fr; } .topbar { align-items:flex-start; } }
</style>
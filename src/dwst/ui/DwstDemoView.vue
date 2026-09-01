<script setup lang="ts">
import { computed, ref } from 'vue';
import DwstCommandPanel from './DwstCommandPanel.vue';
import {
  advanceCanonicalSimulation,
  startCanonicalSimulation,
  resolveOrderDestination,
  type CombatAllocationPolicy,
  type Order,
} from '@/dwst';
import { demoCanonical, demoScenario } from './demoCanonicalFixture';

const policy: CombatAllocationPolicy = {
  personnelDisposition: 'killed',
  equipmentDisposition: 'destroyed',
  eligiblePersonnelStatuses: ['assigned'],
  eligibleEquipmentStatuses: ['operational'],
  selection: 'stable-id',
};

const session = ref(startCanonicalSimulation(demoScenario, demoCanonical));
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

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Order, UnitState } from '@/dwst';
import { parseNaturalLanguageOrder } from '@/dwst';

const props = defineProps<{ units: UnitState[]; turnHours: number }>();
const emit = defineEmits<{
  order: [unitId: string, order: Order];
  advance: [];
  'update:turnHours': [turnHours: number];
}>();

const selectedId = ref(props.units[0]?.id ?? '');
const commandText = ref('');

const selected = computed(() => props.units.find(u => u.id === selectedId.value));
const preview = computed(() => parseNaturalLanguageOrder(commandText.value, selected.value));

function submitOrder() {
  if (!selected.value || !commandText.value.trim()) return;
  emit('order', selected.value.id, preview.value.order);
  commandText.value = '';
}
</script>

<template>
  <section class="dwst-command-panel" aria-label="DWST operational command">
    <header>
      <strong>DWST COMMAND</strong>
      <span>WWII · Operational</span>
    </header>

    <label>
      Formation
      <select v-model="selectedId">
        <option v-for="unit in units" :key="unit.id" :value="unit.id">
          {{ unit.name }} ({{ unit.side }})
        </option>
      </select>
    </label>

    <label>
      Order
      <textarea v-model="commandText" rows="4" placeholder="e.g. Have 2nd Panzer Division attack toward Bastogne aggressively and immediately." />
    </label>

    <div v-if="commandText" class="preview">
      <div><b>Interpretation:</b> {{ preview.order.type }}</div>
      <div v-if="preview.order.objective"><b>Objective:</b> {{ preview.order.objective }}</div>
      <div><b>Posture:</b> {{ preview.order.posture }}</div>
      <div><b>Priority:</b> {{ preview.order.priority }}</div>
      <div><b>Confidence:</b> {{ Math.round(preview.confidence * 100) }}%</div>
      <div v-for="warning in preview.warnings" :key="warning" class="warning">{{ warning }}</div>
    </div>

    <div class="actions">
      <button :disabled="!selected || !commandText.trim()" @click="submitOrder">Issue Order</button>
      <label class="turn">
        Turn
        <select :value="turnHours" @change="emit('update:turnHours', Number(($event.target as HTMLSelectElement).value))">
          <option :value="1">1h</option><option :value="3">3h</option><option :value="6">6h</option><option :value="12">12h</option><option :value="24">24h</option>
        </select>
      </label>
      <button class="advance" @click="emit('advance')">Resolve Turn</button>
    </div>
  </section>
</template>

<style scoped>
.dwst-command-panel { display:flex; flex-direction:column; gap:12px; padding:14px; max-width:420px; background:var(--surface, #fff); border:1px solid #ccc; border-radius:8px; font:14px system-ui,sans-serif; }
header { display:flex; justify-content:space-between; align-items:center; gap:12px; } header span { opacity:.65; font-size:12px; }
label { display:flex; flex-direction:column; gap:5px; font-weight:600; } select, textarea { font:inherit; padding:8px; border:1px solid #aaa; border-radius:5px; } textarea { resize:vertical; }
.preview { padding:9px; background:#f5f5f5; border-radius:5px; line-height:1.5; } .warning { margin-top:5px; font-weight:500; }
.actions { display:flex; gap:8px; align-items:end; flex-wrap:wrap; } button { padding:8px 12px; border:1px solid #888; border-radius:5px; cursor:pointer; } button:disabled { opacity:.45; cursor:not-allowed; } .advance { margin-left:auto; } .turn { font-size:12px; }
</style>
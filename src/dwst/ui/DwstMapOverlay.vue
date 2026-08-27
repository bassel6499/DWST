<script setup lang="ts">
import { computed } from 'vue';
import type { ScenarioState } from '@/dwst/core/types';
import { scenarioToGeoJSON } from '@/dwst/core/mapState';

const props = defineProps<{ state: ScenarioState }>();
const geojson = computed(() => scenarioToGeoJSON(props.state));
</script>

<template>
  <div class="dwst-map-overlay" aria-label="DWST map unit status">
    <div class="legend"><span class="allied">■</span> Allied <span class="enemy">■</span> Enemy</div>
    <div v-for="feature in geojson.features" :key="feature.properties.id" class="contact" :class="feature.properties.side">
      <span class="symbol">■</span>
      <div><b>{{ feature.properties.name }}</b><small>{{ feature.geometry.coordinates[1].toFixed(3) }}, {{ feature.geometry.coordinates[0].toFixed(3) }} · {{ feature.properties.status }}</small></div>
    </div>
  </div>
</template>

<style scoped>
.dwst-map-overlay { background:rgba(255,255,255,.94); border:1px solid #bbb; border-radius:7px; padding:8px; min-width:220px; font:12px system-ui,sans-serif; box-shadow:0 2px 8px rgba(0,0,0,.12); }
.legend { padding-bottom:6px; border-bottom:1px solid #ddd; margin-bottom:5px; } .allied { color:#2672b8; } .enemy { color:#a33; } .contact { display:flex; gap:7px; padding:5px 2px; align-items:flex-start; } .symbol { font-size:18px; line-height:14px; } .contact.allied .symbol { color:#2672b8; } .contact.enemy .symbol { color:#a33; } small { display:block; opacity:.65; margin-top:2px; }
</style>

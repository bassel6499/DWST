import type { ScenarioState, UnitState } from './types';

export interface DwstMapFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    id: string;
    name: string;
    side: UnitState['side'];
    status: UnitState['status'];
    personnel: number;
    readiness: number;
    order?: string;
  };
}

export function scenarioToGeoJSON(state: ScenarioState) {
  return {
    type: 'FeatureCollection' as const,
    features: Object.values(state.units).map<DwstMapFeature>(unit => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [unit.position.lon, unit.position.lat] },
      properties: {
        id: unit.id,
        name: unit.name,
        side: unit.side,
        status: unit.status,
        personnel: unit.personnel,
        readiness: unit.readiness,
        order: unit.order?.type,
      },
    })),
  };
}

import type { SimulationEvent, UnitEvent } from './types';

/**
 * Project a committed simulation event into the per-unit audit history.
 * History is an audit trail; canonical state remains authoritative.
 */
export function unitEventsFromSimulationEvent(
  event: SimulationEvent,
  lossesByUnit: Readonly<Record<string, { personnelLosses: number; equipmentLosses: number }>> = {},
): Array<{ unitId: string; event: UnitEvent }> {
  return event.unitIds.map((unitId) => {
    const losses = lossesByUnit[unitId];
    return {
      unitId,
      event: {
        turn: event.turn,
        type: event.phase,
        summary: event.message,
        ...(losses && losses.personnelLosses > 0 ? { personnelLosses: losses.personnelLosses } : {}),
        ...(losses && losses.equipmentLosses > 0 ? { equipmentLosses: losses.equipmentLosses } : {}),
      },
    };
  });
}

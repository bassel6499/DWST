import type { SimulationReport } from './types';

/**
 * Render a SimulationReport as deterministic plain text for non-graphical
 * consumers. This is presentation-only: it does not resolve turns or mutate
 * simulation state.
 */
export function formatSimulationReport(report: SimulationReport): string {
  const lines: string[] = [
    `Turn ${report.turn}`,
    `Elapsed hours: ${report.elapsedHours}`,
    '',
    'Events:',
  ];

  const events = [...report.events].sort((a, b) => {
    const phase = a.phase.localeCompare(b.phase);
    if (phase !== 0) return phase;
    const message = a.message.localeCompare(b.message);
    if (message !== 0) return message;
    return a.unitIds.join(',').localeCompare(b.unitIds.join(','));
  });

  if (events.length === 0) {
    lines.push('- none');
  } else {
    for (const event of events) {
      const units = [...event.unitIds].sort().join(', ');
      lines.push(`- [${event.phase}] ${event.message}${units ? ` (units: ${units})` : ''}`);
    }
  }

  lines.push('', 'Units:');
  const units = [...report.units].sort((a, b) => a.id.localeCompare(b.id));
  if (units.length === 0) {
    lines.push('- none');
  } else {
    for (const unit of units) {
      lines.push(
        `- ${unit.id}: ${unit.name} | side=${unit.side} | status=${unit.status} | personnel=${unit.personnel} | equipment=${unit.equipment} | ammunition=${unit.ammunition} | fuel=${unit.fuel}`,
      );
    }
  }

  lines.push('', 'Resource deltas:');
  const deltas = [...report.resourceDeltas].sort((a, b) => a.unitId.localeCompare(b.unitId));
  if (deltas.length === 0) {
    lines.push('- none');
  } else {
    for (const delta of deltas) {
      lines.push(
        `- ${delta.unitId}: personnel=${delta.personnel}, equipment=${delta.equipment}, ammunition=${delta.ammunition}, fuel=${delta.fuel}`,
      );
    }
  }

  return lines.join('\n');
}

import type { Order, UnitState } from './types';

export interface ParsedOrder {
  order: Order;
  confidence: number;
  warnings: string[];
}

const findDestination = (text: string) => {
  const match = text.match(/(?:toward|to|on|at)\s+([A-Za-z0-9][A-Za-z0-9 .'-]{1,60})/i);
  return match?.[1]?.trim();
};

/** Converts simple natural-language orders into a structured order.
 * It is deliberately conservative: ambiguous text becomes a warning rather
 * than silently inventing an objective or destination.
 */
export function parseNaturalLanguageOrder(text: string, unit?: UnitState): ParsedOrder {
  const lower = text.toLowerCase();
  const warnings: string[] = [];
  let type: Order['type'] = 'move';

  if (/attack|assault|seize|take/.test(lower)) type = 'attack';
  else if (/defend|hold|secure/.test(lower)) type = 'defend';
  else if (/screen|cover/.test(lower)) type = 'screen';
  else if (/reserve|stand by/.test(lower)) type = 'reserve';
  else if (/withdraw|retreat|fall back/.test(lower)) type = 'withdraw';
  else if (/recon|reconnaissance|scout/.test(lower)) type = 'recon';

  const objective = findDestination(text);
  if (!objective && type !== 'reserve') warnings.push('No explicit destination/objective was confidently identified.');
  if (!unit) warnings.push('No unit was supplied for validation.');

  const posture: Order['posture'] = /aggressive|rapid|maximum/.test(lower)
    ? 'aggressive'
    : /cautious|careful|avoid/.test(lower)
      ? 'cautious'
      : 'normal';

  const priority: Order['priority'] = /urgent|immediately|priority/.test(lower) ? 'high' : 'normal';

  return {
    order: { type, objective, posture, priority, text },
    confidence: objective || type !== 'move' ? 0.8 : 0.55,
    warnings,
  };
}

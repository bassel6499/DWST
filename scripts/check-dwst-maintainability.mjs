import { readFile } from 'node:fs/promises';

const limits = new Map([
  ['src/dwst/scenarios/ww2/combat.ts', 260],
  ['src/dwst/scenarios/ww2/combatCapability.ts', 180],
  ['src/dwst/scenarios/ww2/combatGeometry.ts', 220],
  ['src/dwst/scenarios/ww2/combatTargetInteraction.ts', 180],
  ['src/dwst/scenarios/ww2/combatResolution.ts', 220],
  ['src/dwst/scenarios/ww2/combatAttrition.ts', 160],
  ['src/dwst/scenarios/ww2/combatEffects.ts', 240],
  ['src/dwst/scenarios/ww2/combatOutcome.ts', 180],
]);

const failures = [];
for (const [file, limit] of limits) {
  const text = await readFile(file, 'utf8');
  const lines = text.split(/\r?\n/).length;
  if (lines > limit) failures.push(`${file}: ${lines} lines exceeds maintainability limit ${limit}`);
  if (/\bas any\b/.test(text)) failures.push(`${file}: untyped "as any" cast is not allowed in the combat model`);
}

const coefficients = await readFile('src/dwst/scenarios/ww2/combatCoefficients.ts', 'utf8');
if (!coefficients.includes('WW2_COMBAT_COEFFICIENTS')) failures.push('combat coefficients must remain centralized');
if (!coefficients.includes('baseRate')) failures.push('combat coefficient registry is missing baseRate');

if (failures.length) {
  console.error('DWST maintainability gate failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('DWST maintainability gate passed.');

import { describe, expect, it } from 'vitest';
import { calculateEngagementSurprise } from './combatDetection';
import type { Contact } from './detection';

describe('engagement detection integration',()=>{
 const contact=(confidence:Contact['confidence'],detected=true):Contact=>({observerId:'d',targetId:'a',distanceKm:5,probability:detected?1:0.5,detected,confidence});
 it('increases surprise when the defender has no returned contact',()=>{
  expect(calculateEngagementSurprise('a','d',0.7,0.7,[])).toBeCloseTo(0.15);
 });
 it('reduces surprise when the defender has unit-level detection',()=>{
  expect(calculateEngagementSurprise('a','d',0.7,0.7,[contact('unit')])).toBeCloseTo(-0.08);
 });
 it('reduces surprise more when the defender has formation-level detection',()=>{
  expect(calculateEngagementSurprise('a','d',0.7,0.7,[contact('formation')])).toBeCloseTo(-0.15);
 });
});

import type { Contact } from './detection';

const clamp=(v:number,min=-0.5,max=0.5)=>Math.max(min,Math.min(max,v));

/** Deterministically translates defender detection quality into engagement surprise. */
export function calculateEngagementSurprise(attackerId:string,defenderId:string,attackerIntelligence:number,defenderIntelligence:number,contacts:readonly Contact[]):number{
  const base=clamp(attackerIntelligence-defenderIntelligence);
  const defenderContact=contacts.find(c=>c.observerId===defenderId&&c.targetId===attackerId);
  if(!defenderContact)return clamp(base+0.15);
  if(!defenderContact.detected)return clamp(base+0.10);
  const confidencePenalty=defenderContact.confidence==='formation'?0.15:defenderContact.confidence==='unit'?0.08:0.02;
  return clamp(base-confidencePenalty);
}

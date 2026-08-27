import type { CanonicalResourceLedger } from './canonicalLedger';
import type { PersonnelRegistry } from './personnelRegistry';

export interface LegacyForce { personnel:number; }
export interface MigrationResult { registry:PersonnelRegistry; ledger:CanonicalResourceLedger; warnings:string[]; errors:string[]; }

/**
 * Conservative migration: only creates explicit personnel records when the legacy
 * source already supplies an authoritative manpower total. No specialist identities
 * or equipment crews are fabricated. Ambiguous legacy crew data is reported as a warning.
 */
export function migrateLegacyForce(source:LegacyForce, ledger:CanonicalResourceLedger):MigrationResult {
 const errors:string[]=[]; const warnings:string[]=[];
 if(!Number.isInteger(source.personnel)||source.personnel<0) errors.push('Legacy personnel total must be a non-negative integer');
 if(errors.length) return {registry:{personnel:[]},ledger,warnings,errors};
 const personnel=Array.from({length:source.personnel},(_,i)=>({id:`legacy-p-${i+1}`,status:'available' as const,qualifications:[],experience:{}}));
 warnings.push('Legacy personnel identities are synthetic migration IDs, not historical individual identities.');
 warnings.push('Legacy aggregate crew/equipment assignments are not inferred; they require explicit qualification data before use.');
 return {registry:{personnel},ledger,warnings,errors:[]};
}

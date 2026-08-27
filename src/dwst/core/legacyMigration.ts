import type { CanonicalResourceLedger } from './canonicalLedger';
import type { PersonnelRegistry } from './personnelRegistry';

export interface LegacyForce { personnel:number; }
export interface MigrationResult { registry:PersonnelRegistry; ledger:CanonicalResourceLedger; warnings:string[]; errors:string[]; }

/**
 * Conservative migration: legacy manpower is kept aggregate-only because an
 * aggregate total does not contain authoritative individual identities. No
 * synthetic personnel records are created and no crew/equipment assignments
 * are inferred.
 */
export function migrateLegacyForce(source:LegacyForce, ledger:CanonicalResourceLedger):MigrationResult {
 const errors:string[]=[]; const warnings:string[]=[];
 if(!Number.isInteger(source.personnel)||source.personnel<0) errors.push('Legacy personnel total must be a non-negative integer');
 if(errors.length) return {registry:{personnel:[]},ledger,warnings,errors};
 warnings.push('Legacy personnel remains aggregate-only; individual identities are not fabricated from a manpower total.');
 warnings.push('Legacy aggregate crew/equipment assignments are not inferred; they require explicit canonical data before use.');
 return {registry:{personnel:[]},ledger,warnings,errors:[]};
}

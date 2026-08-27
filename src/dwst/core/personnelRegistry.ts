import type { CrewExperience, PersonnelStatus } from './canonicalLedger';

export interface PersonnelRecord {
  id:string;
  /** Canonical organizational ownership. Omit for legacy aggregate-only records. */
  unitId?:string;
  status:PersonnelStatus;
  qualifications:string[];
  experience:Partial<Record<CrewExperience,number>>;
}

export interface PersonnelRegistry { personnel:PersonnelRecord[]; }

export function validatePersonnelRegistry(registry:PersonnelRegistry,totalPersonnel:number):string[]{
  const errors:string[]=[]; const ids=new Set<string>();
  if(registry.personnel.length!==totalPersonnel) errors.push('Personnel registry count does not equal authoritative personnel total');
  for(const p of registry.personnel){
    if(!p.id) errors.push('Personnel record requires an ID');
    if(ids.has(p.id)) errors.push(`Duplicate personnel ID: ${p.id}`); ids.add(p.id);
    if(p.unitId!==undefined&&!p.unitId) errors.push(`Personnel unitId cannot be empty: ${p.id}`);
    if(!['available','training','assigned','wounded','killed','missing'].includes(p.status)) errors.push(`Invalid personnel status: ${p.id}`);
    if(new Set(p.qualifications).size!==p.qualifications.length) errors.push(`Duplicate qualification on personnel: ${p.id}`);
  }
  return errors;
}

export function personnelStatusCounts(registry:PersonnelRegistry):Record<PersonnelStatus,number>{
  const out:Record<PersonnelStatus,number>={available:0,training:0,assigned:0,wounded:0,killed:0,missing:0};
  for(const p of registry.personnel) out[p.status]++;
  return out;
}

import type { EquipmentLedger, EquipmentCrewLink, SpecialistPool } from './canonicalLedger';

export interface EquipmentAssignment { equipmentId:string; personnelIds:string[]; }

export function usableEquipmentByCrew(
  equipment: EquipmentLedger,
  link: EquipmentCrewLink,
  specialists: SpecialistPool[],
): number {
  const pool=specialists.find(s=>s.specialty===link.crewSpecialty);
  if(!pool || link.requiredQualifiedCrew<=0) return 0;
  return Math.min(equipment.operational, Math.floor(pool.qualified/link.requiredQualifiedCrew));
}

export function validateAssignments(
  assignments: EquipmentAssignment[],
  equipment: EquipmentLedger[],
  links: EquipmentCrewLink[],
  specialists: SpecialistPool[],
): string[] {
  const errors:string[]=[];
  const used=new Set<string>();
  for(const a of assignments){
    const e=equipment.find(x=>x.designation===a.equipmentId || x.type===a.equipmentId);
    if(!e){ errors.push(`Assignment references unknown equipment: ${a.equipmentId}`); continue; }
    const link=links.find(x=>x.equipmentId===a.equipmentId);
    if(!link){ errors.push(`No crew requirement exists for equipment: ${a.equipmentId}`); continue; }
    if(a.personnelIds.length!==link.requiredQualifiedCrew) errors.push(`Crew size mismatch for ${a.equipmentId}`);
    for(const id of a.personnelIds){ if(used.has(id)) errors.push(`Personnel assigned to multiple equipment systems: ${id}`); used.add(id); }
    const pool=specialists.find(s=>s.specialty===link.crewSpecialty);
    for(const id of a.personnelIds){
      if(!pool || !pool.personnelIds.includes(id)) errors.push(`Personnel ${id} is not in required crew pool for ${a.equipmentId}`);
    }
  }
  return errors;
}

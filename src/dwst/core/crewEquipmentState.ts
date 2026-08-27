import type { EquipmentLedger, EquipmentCrewLink, SpecialistPool } from './canonicalLedger';
import type { PersonnelRegistry } from './personnelRegistry';

export interface EquipmentReadiness { equipmentId:string; operational:number; crewReady:number; crewShort:number; usable:number; }

export function projectEquipmentReadiness(equipment:EquipmentLedger,link:EquipmentCrewLink,registry:PersonnelRegistry,pool:SpecialistPool):EquipmentReadiness {
 const liveQualified=(pool.personnelIds ?? []).filter(id=>{
  const p=registry.personnel.find(x=>x.id===id);
  return !!p && (p.status==='available'||p.status==='assigned') && p.qualifications.includes(link.crewSpecialty);
 }).length;
 const usable=Math.min(equipment.operational,Math.floor(liveQualified/link.requiredQualifiedCrew));
 return {equipmentId:equipment.designation,operational:equipment.operational,crewReady:liveQualified,crewShort:Math.max(0,equipment.operational*link.requiredQualifiedCrew-liveQualified),usable};
}

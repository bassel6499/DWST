import type { PersonnelRegistry } from './personnelRegistry';
import type { EquipmentDefinition } from './equipmentCatalog';

export interface CrewAssignment { equipmentId:string; slot:number; personnelId:string; specialty:string; }

export function validateCrewAssignments(assignments:CrewAssignment[], registry:PersonnelRegistry, equipment:EquipmentDefinition[]):string[]{
 const errors:string[]=[]; const used=new Set<string>(); const knownEquipment=new Map(equipment.map(e=>[e.id,e]));
 for(const a of assignments){
  const p=registry.personnel.find(x=>x.id===a.personnelId);
  const e=knownEquipment.get(a.equipmentId);
  if(!p) { errors.push(`Unknown personnel ID: ${a.personnelId}`); continue; }
  if(!e) { errors.push(`Unknown equipment ID: ${a.equipmentId}`); continue; }
  if(!Number.isInteger(a.slot)||a.slot<1) errors.push(`Invalid crew slot for ${a.equipmentId}`);
  if(used.has(a.personnelId)) errors.push(`Personnel assigned to multiple equipment slots: ${a.personnelId}`);
  used.add(a.personnelId);
  if(p.status!=='assigned') errors.push(`Personnel must be assigned before crewing equipment: ${a.personnelId}`);
  if(!p.qualifications.includes(a.specialty)) errors.push(`Personnel lacks qualification ${a.specialty}: ${a.personnelId}`);
 }
 return errors;
}

export function crewedEquipmentCount(assignments:CrewAssignment[], equipmentId:string, requiredCrew:number):number{
 if(!Number.isInteger(requiredCrew)||requiredCrew<=0) return 0;
 const slots=new Set(assignments.filter(a=>a.equipmentId===equipmentId).map(a=>a.slot));
 return slots.size>=requiredCrew ? 1 : 0;
}

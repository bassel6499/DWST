import type { CrewExperience } from './canonicalLedger';
import type { CrewSpecialty } from './crews';
import type { PersonnelRecord, PersonnelRegistry } from './personnelRegistry';

export interface QualificationTrainingOrder { personnelId:string; specialty:CrewSpecialty; requiredHours:number; elapsedHours:number; }
export interface QualificationResult { personnelId:string; specialty:CrewSpecialty; completed:boolean; remainingHours:number; }

export function advanceQualification(order:QualificationTrainingOrder,hours:number):QualificationResult {
 if(!Number.isFinite(hours)||hours<0) throw new Error('Training advance must be non-negative');
 if(!Number.isFinite(order.requiredHours)||order.requiredHours<=0) throw new Error('Required training hours must be positive');
 if(!Number.isFinite(order.elapsedHours)||order.elapsedHours<0||order.elapsedHours>order.requiredHours) throw new Error('Invalid training progress');
 const elapsed=Math.min(order.requiredHours,order.elapsedHours+hours);
 return {personnelId:order.personnelId,specialty:order.specialty,completed:elapsed>=order.requiredHours,remainingHours:order.requiredHours-elapsed};
}

export function canQualifyPersonnel(person:PersonnelRecord,order:QualificationTrainingOrder):string[]{
 const errors:string[]=[];
 if(person.id!==order.personnelId)errors.push('Training order personnel ID does not match record');
 if(person.status!=='training')errors.push(`Personnel ${person.id} must be in training status`);
 if(person.status==='killed'||person.status==='missing'||person.status==='wounded')errors.push(`Personnel ${person.id} is unavailable for qualification`);
 return errors;
}
export function initialCrewExperience():CrewExperience{return 'trained';}
export function qualificationReadinessFactor(experience:CrewExperience):number{return experience==='veteran'?1:experience==='experienced'?.9:.75;}
export function registryHasPersonnel(registry:PersonnelRegistry,personnelId:string):boolean{return registry.personnel.some(p=>p.id===personnelId);}

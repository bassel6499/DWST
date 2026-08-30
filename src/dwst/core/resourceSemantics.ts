/** Canonical meanings used by the refactor. These definitions do not depend on aggregate legacy models. */
export interface ResourceAccountingRules {
  personnelStatusIsExclusive:true;
  specialistQualifiedIsSubsetOfSpecialistPersonnel:true;
  specialistExperienceIsSubsetOfQualified:true;
  equipmentStateIsExclusive:true;
  assignedEquipmentIsSubsetOfOperational:true;
  equipmentUseIsCrewLimited:true;
  replacementsRequireExplicitPipeline:true;
  trainingRequiresElapsedTime:true;
}

export const RESOURCE_ACCOUNTING_RULES:ResourceAccountingRules={
  personnelStatusIsExclusive:true,
  specialistQualifiedIsSubsetOfSpecialistPersonnel:true,
  specialistExperienceIsSubsetOfQualified:true,
  equipmentStateIsExclusive:true,
  assignedEquipmentIsSubsetOfOperational:true,
  equipmentUseIsCrewLimited:true,
  replacementsRequireExplicitPipeline:true,
  trainingRequiresElapsedTime:true
};

export interface EquipmentCrewRequirement {
  equipmentType:string;
  crewSpecialty:string;
  personnelPerSystem:number;
}

export function requiredCrewForSystems(requirement:EquipmentCrewRequirement,systems:number):number{
  if(!Number.isInteger(systems)||systems<0) throw new Error('systems must be a non-negative integer');
  if(!Number.isInteger(requirement.personnelPerSystem)||requirement.personnelPerSystem<=0) throw new Error('personnelPerSystem must be a positive integer');
  return systems*requirement.personnelPerSystem;
}

export function crewLimitedSystems(operational:number,qualifiedPersonnel:number,personnelPerSystem:number):number{
  if(![operational,qualifiedPersonnel,personnelPerSystem].every(Number.isFinite)) throw new Error('Invalid crew/equipment values');
  if(operational<0||qualifiedPersonnel<0||personnelPerSystem<=0) throw new Error('Invalid crew/equipment values');
  return Math.min(Math.floor(operational),Math.floor(qualifiedPersonnel/personnelPerSystem));
}
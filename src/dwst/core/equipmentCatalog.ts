import { getCrewRequirement } from './crewRequirements';

export interface EquipmentDefinition {
  id:string;
  name:string;
  era:string;
  equipmentType:string;
  crewRequirementId:string;
}

export function resolveCrewRequirement(definition:EquipmentDefinition){
  const requirement=getCrewRequirement(definition.equipmentType,definition.era);
  if(!requirement) throw new Error(`No crew requirement for ${definition.name} (${definition.era})`);
  return requirement;
}

export function validateEquipmentDefinition(definition:EquipmentDefinition):string[]{
  const errors:string[]=[];
  if(!definition.id||!definition.name) errors.push('Equipment definition requires id and name');
  if(!definition.era||!definition.equipmentType) errors.push('Equipment definition requires era and equipmentType');
  if(!definition.crewRequirementId) errors.push('Equipment definition requires crewRequirementId');
  const requirement=getCrewRequirement(definition.equipmentType,definition.era);
  if(!requirement) errors.push(`Missing crew requirement for ${definition.name} (${definition.era})`);
  else if(definition.crewRequirementId!==`${requirement.era}:${requirement.equipmentType}:${requirement.specialty}`) errors.push(`Crew requirement reference mismatch for ${definition.name}`);
  return errors;
}

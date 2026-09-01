export interface CrewRequirement { equipmentType:string; era:string; specialty:string; requiredQualifiedCrew:number; }

/** Data only: changing a requirement cannot alter combat equations. */
export const crewRequirements:ReadonlyArray<CrewRequirement>=[
 {equipmentType:'tank',era:'WWI',specialty:'tankCrew',requiredQualifiedCrew:5},
 {equipmentType:'tank',era:'WWII',specialty:'tankCrew',requiredQualifiedCrew:5},
 {equipmentType:'tank',era:'Cold War',specialty:'tankCrew',requiredQualifiedCrew:4},
 {equipmentType:'tank',era:'Modern',specialty:'tankCrew',requiredQualifiedCrew:3},
 {equipmentType:'atGun',era:'WWI',specialty:'atGunCrew',requiredQualifiedCrew:6},
 {equipmentType:'atGun',era:'WWII',specialty:'atGunCrew',requiredQualifiedCrew:6},
 {equipmentType:'artillery',era:'WWI',specialty:'artilleryCrew',requiredQualifiedCrew:8},
 {equipmentType:'artillery',era:'WWII',specialty:'artilleryCrew',requiredQualifiedCrew:8},
];

export function getCrewRequirement(equipmentType:string,era:string):CrewRequirement|undefined{
 return crewRequirements.find(x=>x.equipmentType===equipmentType&&x.era===era);
}

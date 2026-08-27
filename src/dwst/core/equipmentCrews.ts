import type { EquipmentPool } from './equipment';
import { usableEquipment, type CrewPool } from './crews';

/** Returns equipment that can actually be operated by currently ready crews. */
export function operationalWithCrews(pools:EquipmentPool[],crews:CrewPool[]):EquipmentPool[]{
 return pools.map(p=>({...p,operational:usableEquipment(p,crews)}));
}

/** Equipment without enough trained crews remains physically present but is non-operational. */
export function crewGaps(pools:EquipmentPool[],crews:CrewPool[]){
 return pools.map(p=>({type:p.type,name:p.name,physicalOperational:p.operational,crewLimitedOperational:usableEquipment(p,crews),uncrewed:Math.max(0,p.operational-usableEquipment(p,crews))}));
}

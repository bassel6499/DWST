export interface SupplyRoute {
  id: string;
  capacity: number;
  interdiction: number;
}

export interface SupplyResult { delivered:number; lost:number; effectiveCapacity:number; }
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export function resolveSupply(route:SupplyRoute,requested:number):SupplyResult {
 const effectiveCapacity=Math.max(0,route.capacity*(1-clamp(route.interdiction)));
 const delivered=Math.min(Math.max(0,requested),effectiveCapacity);
 return {delivered,lost:Math.max(0,Math.min(requested,effectiveCapacity)*clamp(route.interdiction)),effectiveCapacity};
}

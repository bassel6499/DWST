import type { UnitState } from './types';
import type { SimulationBaseline } from './simulationBaseline';
import type { UnitAssessmentPolicy } from './eraRules';
import { relativePersonnelStrength } from './simulationBaseline';

export type UnitAssessmentThresholds=UnitAssessmentPolicy;

export interface UnitAssessment {
  status: UnitState['status'];
  relativePersonnel: number;
  condition: number;
}

const clamp = (value:number,min=0,max=1)=>Math.min(max,Math.max(min,value));

/** Purely assess a unit against a simulation-start baseline and era policy. */
export function assessUnit(unit:UnitState, baseline:SimulationBaseline, thresholds:UnitAssessmentPolicy):UnitAssessment {
  const relativePersonnel=relativePersonnelStrength(unit,baseline);
  const condition=(clamp(unit.readiness)+clamp(unit.morale)+clamp(unit.cohesion))/3;

  // Status precedence is deliberate: destruction outranks disorganization,
  // which outranks a voluntary/ordered withdrawal.
  let status:UnitState['status']='operational';
  if(relativePersonnel<=thresholds.destroyedPersonnel) status='destroyed';
  else if(relativePersonnel<=thresholds.disorganizedPersonnel || condition<=thresholds.disorganizedCondition) status='disorganized';
  else if(unit.order?.type==='withdraw') status='withdrawn';

  return {status,relativePersonnel,condition};
}

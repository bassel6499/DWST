import type { UnitState } from './types';
import type { SimulationBaseline } from './simulationBaseline';
import { relativePersonnelStrength } from './simulationBaseline';

export interface UnitAssessmentThresholds {
  /** Personnel fraction at or below which the unit is destroyed. */
  destroyedPersonnel: number;
  /** Personnel fraction at or below which the unit is disorganized. */
  disorganizedPersonnel: number;
  /** Combined readiness/morale/cohesion threshold for disorganization. */
  disorganizedCondition: number;
}

export interface UnitAssessment {
  status: UnitState['status'];
  relativePersonnel: number;
  condition: number;
}

const clamp = (value:number,min=0,max=1)=>Math.min(max,Math.max(min,value));

/** Purely assess a unit against a simulation-start baseline and ruleset policy. */
export function assessUnit(unit:UnitState, baseline:SimulationBaseline, thresholds:UnitAssessmentThresholds):UnitAssessment {
  const relativePersonnel=relativePersonnelStrength(unit,baseline);
  const condition=(clamp(unit.readiness)+clamp(unit.morale)+clamp(unit.cohesion))/3;
  let status:UnitState['status']='operational';
  if(relativePersonnel<=thresholds.destroyedPersonnel) status='destroyed';
  else if(relativePersonnel<=thresholds.disorganizedPersonnel || condition<=thresholds.disorganizedCondition) status='disorganized';
  else if(unit.order?.type==='withdraw') status='withdrawn';
  return {status,relativePersonnel,condition};
}

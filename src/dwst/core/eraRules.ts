import type { EraId } from './types';

export type CombatLaw='linear'|'mixed'|'new-square'|'square'|'contemporary-hybrid'|'extended-square';

export interface EngineCoefficients {
  movementHours:number;
  movementReadinessWeight:number;
  movementCommandWeight:number;
  movementFatigue:number;
  movementWear:number;
  movementFuel:number;
  turnFatigue:number;
  logisticsDrain:number;
  readinessDrain:number;
  readinessLogisticsWeight:number;
  readinessFatiguePenalty:number;
  readinessWearPenalty:number;
  trainingEffect:number;
  experienceEffect:number;
  cohesionEffect:number;
  moraleEffect:number;
  commandEffect:number;
}

export interface UnitAssessmentPolicy {
  /** Personnel fraction at or below which the unit is destroyed. */
  destroyedPersonnel:number;
  /** Personnel fraction at or below which the unit is disorganized. */
  disorganizedPersonnel:number;
  /** Mean readiness/morale/cohesion at or below which the unit is disorganized. */
  disorganizedCondition:number;
}

export interface EraRuleset {
  id:EraId;
  label:string;
  /** True only when this era has a complete, validated implementation. */
  implemented:boolean;
  combatLaw:CombatLaw;
  rangedFire:boolean;
  spatialModel:'none'|'pde'|'pde-hybrid';
  defaultTurnHours:number;
  equipmentCrewCoupling:boolean;
  permanentAttrition:boolean;
  logisticsEnabled:boolean;
  engine:EngineCoefficients;
  unitAssessment:UnitAssessmentPolicy;
  notes:string[];
}

const DEFAULT_ENGINE:EngineCoefficients={
  movementHours:6,
  movementReadinessWeight:0.65,
  movementCommandWeight:0.3,
  movementFatigue:0.04,
  movementWear:0.02,
  movementFuel:0.04,
  turnFatigue:0.01,
  logisticsDrain:0.015,
  readinessDrain:0.005,
  readinessLogisticsWeight:0.4,
  readinessFatiguePenalty:0.35,
  readinessWearPenalty:0.25,
  trainingEffect:0.25,
  experienceEffect:0.25,
  cohesionEffect:0.25,
  moraleEffect:0.25,
  commandEffect:0.2,
};

const DEFAULT_UNIT_ASSESSMENT:UnitAssessmentPolicy={
  destroyedPersonnel:0.2,
  disorganizedPersonnel:0.5,
  disorganizedCondition:0.4,
};

const base=(id:EraId,label:string,combatLaw:CombatLaw,turn:number):EraRuleset=>({id,label,implemented:false,combatLaw,rangedFire:true,spatialModel:'pde-hybrid',defaultTurnHours:turn,equipmentCrewCoupling:true,permanentAttrition:true,logisticsEnabled:true,engine:{...DEFAULT_ENGINE},unitAssessment:{...DEFAULT_UNIT_ASSESSMENT},notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']});

export const ERA_RULESETS:Record<EraId,EraRuleset>={
 ancient:{...base('ancient','Ancient','linear',24),rangedFire:false,spatialModel:'pde',notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 medieval:{...base('medieval','Medieval','mixed',12),spatialModel:'pde',notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 'early-modern':{...base('early-modern','Early Modern','new-square',12),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 industrial:{...base('industrial','Industrial','square',6),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 ww1:{...base('ww1','World War I','square',6),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 interwar:{...base('interwar','Interwar','square',6),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 ww2:{...base('ww2','World War II','square',6),implemented:true,notes:['First runnable DWST ruleset. Combined arms, operational maneuver and high-tempo logistics.']},
 'early-cold-war':{...base('early-cold-war','Early Cold War','square',3),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 'late-cold-war':{...base('late-cold-war','Late Cold War','square',3),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 'post-cold-war':{...base('post-cold-war','Post-Cold War','contemporary-hybrid',3),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 contemporary:{...base('contemporary','Contemporary','contemporary-hybrid',1),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']},
 future:{...base('future','Future','extended-square',1),notes:['Ruleset scaffold only; not runnable until its era-specific mechanics are implemented and validated.']}
};

export function getEraRuleset(id:EraId):EraRuleset{return ERA_RULESETS[id];}
export function getImplementedEraRulesets():EraRuleset[]{return Object.values(ERA_RULESETS).filter((r)=>r.implemented);}
export function validateEraRuleset(r:EraRuleset):string[]{const e:string[]=[];if(!r.id||!r.label)e.push('Era ruleset requires id and label');if(r.defaultTurnHours<=0)e.push('defaultTurnHours must be positive');if(r.permanentAttrition!==true)e.push('permanentAttrition must remain enabled for DWST accounting');for(const [k,v] of Object.entries(r.engine)){if(!Number.isFinite(v)||v<0)e.push(`engine.${k} must be a non-negative finite number`);}if(r.engine.movementHours<=0)e.push('engine.movementHours must be positive');const a=r.unitAssessment;if(!a||!Number.isFinite(a.destroyedPersonnel)||!Number.isFinite(a.disorganizedPersonnel)||!Number.isFinite(a.disorganizedCondition))e.push('unitAssessment thresholds must be finite numbers');else{if(a.destroyedPersonnel<0||a.destroyedPersonnel>1)e.push('unitAssessment.destroyedPersonnel must be between 0 and 1');if(a.disorganizedPersonnel<0||a.disorganizedPersonnel>1)e.push('unitAssessment.disorganizedPersonnel must be between 0 and 1');if(a.disorganizedCondition<0||a.disorganizedCondition>1)e.push('unitAssessment.disorganizedCondition must be between 0 and 1');if(a.destroyedPersonnel>a.disorganizedPersonnel)e.push('unitAssessment.destroyedPersonnel must not exceed disorganizedPersonnel');}return e;}

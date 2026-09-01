import type { ReinforcementBatch, TrainingBatch } from './reinforcements';

export interface ReconstitutionTarget { formationId:string; personnel:number; equipment:number; trainedCrews:number; }
export interface ReconstitutionState { pending:ReinforcementBatch[]; training:TrainingBatch[]; applied:Set<string>; }

export function applyAvailableReinforcements(state:ReconstitutionState,currentTurn:number):ReconstitutionTarget[] {
 const out:ReconstitutionTarget[]=[];
 for(const b of state.pending){
  if(state.applied.has(b.id)||currentTurn<b.availableTurn)continue;
  out.push({formationId:b.formationId,personnel:b.personnel,equipment:b.equipment,trainedCrews:b.specialistTraining?.trained??0});
  state.applied.add(b.id);
 }
 return out;
}

export function progressTraining(state:ReconstitutionState,hours:number){
 return state.training.map(t=>{const before=t.trained;t.hoursCompleted=Math.min(t.hoursRequired,t.hoursCompleted+Math.max(0,hours));const p=t.hoursRequired?Math.min(1,t.hoursCompleted/t.hoursRequired):1;t.trained=Math.min(t.trainees,Math.floor(t.trainees*p));t.quality=.35+.65*p;return {id:t.id,trainedThisTurn:t.trained-before,totalTrained:t.trained,quality:t.quality};});
}

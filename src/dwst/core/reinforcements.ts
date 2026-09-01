export type Specialist='tankCrew'|'antiTankCrew'|'artilleryCrew'|'engineer'|'driver'|'radioOperator'|'airCrew';
export interface TrainingBatch { id:string; specialist:Specialist; trainees:number; trained:number; hoursRequired:number; hoursCompleted:number; quality:number; }
export interface ReinforcementBatch { id:string; formationId:string; personnel:number; equipment:number; arrivalTurn:number; availableTurn:number; specialistTraining?:TrainingBatch; }

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export function advanceTraining(batch:TrainingBatch,hours:number):number {
 const before=batch.trained;
 batch.hoursCompleted=Math.min(batch.hoursRequired,batch.hoursCompleted+Math.max(0,hours));
 const progress=batch.hoursRequired<=0?1:batch.hoursCompleted/batch.hoursRequired;
 batch.trained=Math.min(batch.trainees,Math.floor(batch.trainees*progress));
 batch.quality=clamp(.35+.65*progress);
 return batch.trained-before;
}

export function deliverReinforcements(batch:ReinforcementBatch,currentTurn:number){
 if(currentTurn<batch.availableTurn)return {arrived:false,personnel:0,equipment:0,trainedCrews:0};
 return {arrived:true,personnel:batch.personnel,equipment:batch.equipment,trainedCrews:batch.specialistTraining?.trained??0};
}

export interface TrainingOrder { personnelId:string; specialty:string; durationHours:number; elapsedHours:number; }
export interface TrainingResult { personnelId:string; specialty:string; completed:boolean; elapsedHours:number; remainingHours:number; }

/** Pure progression rule. It does not mutate personnel, crew, or equipment state. */
export function advanceTraining(order:TrainingOrder, hours:number):TrainingResult {
  if(!Number.isFinite(hours)||hours<0) throw new Error('Training advance must be non-negative');
  if(!Number.isFinite(order.durationHours)||order.durationHours<=0) throw new Error('Training duration must be positive');
  if(!Number.isFinite(order.elapsedHours)||order.elapsedHours<0||order.elapsedHours>order.durationHours) throw new Error('Invalid training progress');
  const elapsed=Math.min(order.durationHours,order.elapsedHours+hours);
  return {personnelId:order.personnelId,specialty:order.specialty,completed:elapsed>=order.durationHours,elapsedHours:elapsed,remainingHours:order.durationHours-elapsed};
}

export function validateTrainingOrder(order:TrainingOrder):string[] {
  const errors:string[]=[];
  if(!order.personnelId) errors.push('Training order requires personnelId');
  if(!order.specialty) errors.push('Training order requires specialty');
  if(!Number.isFinite(order.durationHours)||order.durationHours<=0) errors.push('Training duration must be positive');
  if(!Number.isFinite(order.elapsedHours)||order.elapsedHours<0||order.elapsedHours>order.durationHours) errors.push('Training progress is invalid');
  return errors;
}

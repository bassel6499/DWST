import type { CombatUnitContext } from '../../core/combatContext';
import type { UnitState } from '../../core/types';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const positive = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);

export const WW2_COMBAT_COEFFICIENTS = Object.freeze({
  baseRate: 0.00035,
  defaultFrontageScaleKm: 0.65,
  minimumEngagedFraction: 0.35,
  directFireRangeKm: 6,
  artilleryRangeKm: 20,
  airRangeKm: 30,
  closeAssaultKm: 3,
  mainEngagementKm: 8,
  suppressionBase: 0.04,
  suppressionFireWeight: 0.24,
  suppressionLossWeight: 0.20,
  disorganizationBase: 0.02,
  disorganizationSuppressionWeight: 0.30,
  disorganizationLossWeight: 0.20,
});

export type WW2CombatPhase = 'approach' | 'main_engagement' | 'close_assault';
export type WW2CombatOutcome = 'attacker_repulsed' | 'attacker_stalls' | 'local_gain' | 'penetration' | 'breakthrough' | 'defender_withdraws';

export interface WW2CombatInput {
  attacker: UnitState;
  defender: UnitState;
  terrainDefense: number;
  weather: number;
  surprise: number;
  distanceKm?: number;
  artillerySupport?: number;
  armorSupport?: number;
  antiArmor?: number;
  airSupport?: number;
  maneuver?: number;
  command?: number;
  attackerContext?: CombatUnitContext;
  defenderContext?: CombatUnitContext;
}

export interface WW2CombatResult {
  attackerLosses: number;
  defenderLosses: number;
  attackerEquipmentLosses: number;
  defenderEquipmentLosses: number;
  attackerAmmunitionDelta: number;
  defenderAmmunitionDelta: number;
  attackerFuelDelta: number;
  defenderFuelDelta: number;
  attackerReadinessDelta: number;
  defenderReadinessDelta: number;
  attackerMoraleDelta: number;
  defenderMoraleDelta: number;
  attackerSuppressionDelta: number;
  defenderSuppressionDelta: number;
  attackerDisorganizationDelta: number;
  defenderDisorganizationDelta: number;
  attackerEffectiveness: number;
  defenderEffectiveness: number;
  outcome: WW2CombatOutcome;
  phase: WW2CombatPhase;
  factors: Record<string, number>;
}

function ratio(n: number, d: number, empty = 0) { return d > 0 ? clamp(n / d) : empty; }
function equipmentCapability(context: CombatUnitContext | undefined) {
  if (!context) return 1;
  const operational = positive(context.equipmentOperational);
  if (operational <= 0) return 0.45;
  const readiness = ratio(context.equipmentReady, operational, 0);
  const crew = ratio(context.crewReady, context.crewRequired, 1);
  const serviceability = clamp(operational / Math.max(operational + context.equipmentDamaged + context.equipmentDestroyed + context.equipmentMissing, 1));
  return clamp(0.35 + 0.30 * readiness + 0.20 * crew + 0.15 * serviceability);
}
function typeCapability(context: CombatUnitContext | undefined, types: string[]) {
  if (!context) return 0;
  const total = Object.values(context.equipmentByType).reduce((a, b) => a + b, 0);
  const count = types.reduce((a, type) => a + (context.equipmentByType[type] ?? 0), 0);
  return ratio(count, total);
}
function frontage(unit: UnitState) { return Math.max(0.25, unit.frontageKm ?? WW2_COMBAT_COEFFICIENTS.defaultFrontageScaleKm * Math.sqrt(Math.max(unit.personnel, 1) / 1000)); }
function mobility(unit: UnitState, armor: number, equipment: number) {
  const defaultMobility = 0.35 + 0.20 * clamp(unit.readiness) + 0.15 * armor + 0.10 * equipment + 0.20 * clamp(unit.commandQuality);
  return clamp(unit.mobility ?? defaultMobility);
}
function phaseFor(distanceKm: number): WW2CombatPhase { if (distanceKm <= WW2_COMBAT_COEFFICIENTS.closeAssaultKm) return 'close_assault'; if (distanceKm <= WW2_COMBAT_COEFFICIENTS.mainEngagementKm) return 'main_engagement'; return 'approach'; }
function rangeFactor(distanceKm: number, artillery: number, air: number) {
  const direct = Math.exp(-distanceKm / WW2_COMBAT_COEFFICIENTS.directFireRangeKm);
  const indirect = Math.exp(-distanceKm / WW2_COMBAT_COEFFICIENTS.artilleryRangeKm);
  const airReach = Math.exp(-distanceKm / WW2_COMBAT_COEFFICIENTS.airRangeKm);
  return clamp(0.45 + 0.30 * direct + 0.18 * indirect * artillery + 0.07 * airReach * air, 0.45, 1);
}
function reserveCommitment(unit: UnitState) { const reserve = clamp(unit.reserveFraction ?? (unit.order?.type === 'reserve' ? 0.65 : 0.15)); return clamp(1 - reserve * 0.35, 0.55, 1); }

/** WW2 combat model: force composition → target interaction → geometry → fire → attrition → tactical outcome. */
export function resolveWW2Combat(i: WW2CombatInput): WW2CombatResult {
  const A0 = positive(i.attacker.personnel), B0 = positive(i.defender.personnel);
  if (A0 <= 0 || B0 <= 0) return {attackerLosses:0,defenderLosses:0,attackerEquipmentLosses:0,defenderEquipmentLosses:0,attackerAmmunitionDelta:0,defenderAmmunitionDelta:0,attackerFuelDelta:0,defenderFuelDelta:0,attackerReadinessDelta:0,defenderReadinessDelta:0,attackerMoraleDelta:0,defenderMoraleDelta:0,attackerSuppressionDelta:0,defenderSuppressionDelta:0,attackerDisorganizationDelta:0,defenderDisorganizationDelta:0,attackerEffectiveness:0,defenderEffectiveness:0,outcome:'attacker_stalls',phase:'approach',factors:{}};
  const q = (u: UnitState) => 0.25*clamp(u.training)+0.20*clamp(u.experience)+0.20*clamp(u.readiness)+0.20*clamp(u.morale)+0.15*clamp(u.cohesion);
  const aq=q(i.attacker),dq=q(i.defender),ammoA=0.45+0.55*clamp(i.attacker.ammunition),ammoB=0.45+0.55*clamp(i.defender.ammunition),sustainA=0.60+0.40*clamp(i.attacker.logistics),sustainB=0.60+0.40*clamp(i.defender.logistics),wearA=1-0.40*clamp(i.attacker.wear),wearB=1-0.40*clamp(i.defender.wear),fatigueA=1-0.45*clamp(i.attacker.fatigue),fatigueB=1-0.45*clamp(i.defender.fatigue),weather=0.70+0.30*clamp(i.weather),terrain=clamp(i.terrainDefense,0.55,1.55),surprise=clamp(i.surprise,-0.5,0.5),distanceKm=Math.max(0,i.distanceKm??0),phase=phaseFor(distanceKm);
  const posture=i.attacker.order?.posture==='aggressive'?0.15:i.attacker.order?.posture==='cautious'?-0.10:0;
  const defenderPosture=i.defender.order?.type==='withdraw'?0.20:i.defender.order?.posture==='cautious'?0.12:i.defender.order?.posture==='aggressive'?-0.08:0;
  const command=clamp(i.command??(i.attacker.commandQuality-i.defender.commandQuality)*0.35+posture-defenderPosture,-0.5,0.5),maneuver=clamp(i.maneuver??posture-defenderPosture,-0.5,0.5);
  const attackerEquipment=equipmentCapability(i.attackerContext),defenderEquipment=equipmentCapability(i.defenderContext),attackerArmor=typeCapability(i.attackerContext,['tank','assaultGun','tankDestroyer']),defenderArmor=typeCapability(i.defenderContext,['tank','assaultGun','tankDestroyer']),attackerAntiArmor=typeCapability(i.attackerContext,['antiTank','tankDestroyer']),defenderAntiArmor=typeCapability(i.defenderContext,['antiTank','tankDestroyer']),attackerArtillery=typeCapability(i.attackerContext,['artillery','selfPropelledArtillery']),defenderArtillery=typeCapability(i.defenderContext,['artillery','selfPropelledArtillery']),attackerAir=typeCapability(i.attackerContext,['aircraft','airSupport']),defenderAir=typeCapability(i.defenderContext,['aircraft','airSupport']);
  const artilleryA=positive(i.artillerySupport??attackerArtillery*0.75),artilleryB=positive(defenderArtillery*0.75),armorA=positive(i.armorSupport??attackerArmor*0.60),armorB=positive(defenderArmor*0.60),antiArmorA=positive(i.antiArmor??attackerAntiArmor*0.80),antiArmorB=positive(defenderAntiArmor*0.80),airA=positive(i.airSupport??attackerAir*0.50),airB=positive(defenderAir*0.50);
  const rangeA=rangeFactor(distanceKm,artilleryA,airA),rangeB=rangeFactor(distanceKm,artilleryB,airB),targetArmorA=defenderArmor>0?1+antiArmorA*(0.65+0.35*defenderArmor):1+0.25*antiArmorA,targetArmorB=attackerArmor>0?1+antiArmorB*(0.65+0.35*attackerArmor):1+0.25*antiArmorB,armorTargetA=defenderArmor>0?1+armorA*(0.35+0.65*(1-defenderAntiArmor)):1+armorA*0.75,armorTargetB=attackerArmor>0?1+armorB*(0.35+0.65*(1-attackerAntiArmor)):1+armorB*0.75,artilleryTargetA=defenderArmor>0?0.75+0.25*(1-defenderArmor):1,artilleryTargetB=attackerArmor>0?0.75+0.25*(1-attackerArmor):1;
  const frontA=frontage(i.attacker),frontB=frontage(i.defender),engagedA=clamp(frontB/frontA,WW2_COMBAT_COEFFICIENTS.minimumEngagedFraction,1),engagedB=clamp(frontA/frontB,WW2_COMBAT_COEFFICIENTS.minimumEngagedFraction,1),densityA=A0/frontA,densityB=B0/frontB,densityRatioA=clamp(Math.sqrt(densityA/Math.max(densityB,1)),0.65,1.45),densityRatioB=clamp(Math.sqrt(densityB/Math.max(densityA,1)),0.65,1.45),reserveA=reserveCommitment(i.attacker),reserveB=reserveCommitment(i.defender);
  const attackerCapability=attackerEquipment*(0.72+0.28*clamp(i.attacker.combatPower)),defenderCapability=defenderEquipment*(0.72+0.28*clamp(i.defender.combatPower));
  const offenseA=(0.68+0.32*aq)*ammoA*sustainA*wearA*fatigueA*attackerCapability*weather*rangeA*engagedA*densityRatioA*reserveA,offenseB=(0.68+0.32*dq)*ammoB*sustainB*wearB*fatigueB*defenderCapability*weather*rangeB*engagedB*densityRatioB*reserveB;
  const exposure=clamp(1.25-0.35*(terrain-1)-0.20*(1-clamp(i.weather)),0.55,1.35);
  const beta=WW2_COMBAT_COEFFICIENTS.baseRate*offenseB*terrain*exposure*(1+artilleryB*artilleryTargetB)*(1+airB)*targetArmorB*armorTargetB*(1-maneuver*0.45)*(1-command*0.35)*(1-surprise);
  const alpha=WW2_COMBAT_COEFFICIENTS.baseRate*offenseA*exposure*(1+artilleryA*artilleryTargetA)*(1+airA)*targetArmorA*armorTargetA*(1+maneuver*0.65)*(1+command*0.45)*(1+surprise);
  const steps=24,dt=1/steps;let A=A0,B=B0;
  const derivative=(a:number,b:number):[number,number]=>[-Math.min(a,beta*b*b/Math.max(a,1)),-Math.min(b,alpha*a*a/Math.max(b,1))];
  for(let step=0;step<steps&&A>0&&B>0;step+=1){const[k1a,k1b]=derivative(A,B),[k2a,k2b]=derivative(Math.max(0,A+k1a*dt/2),Math.max(0,B+k1b*dt/2)),[k3a,k3b]=derivative(Math.max(0,A+k2a*dt/2),Math.max(0,B+k2b*dt/2)),[k4a,k4b]=derivative(Math.max(0,A+k3a*dt),Math.max(0,B+k3b*dt));A=Math.max(0,A+(k1a+2*k2a+2*k3a+k4a)*dt/6);B=Math.max(0,B+(k1b+2*k2b+2*k3b+k4b)*dt/6);}
  const la=Math.min(A0,Math.max(0,Math.round(A0-A))),lb=Math.min(B0,Math.max(0,Math.round(B0-B))),lossRateA=ratio(la,A0),lossRateB=ratio(lb,B0),equipmentLossA=Math.min(i.attacker.equipment,Math.round(i.attacker.equipment*(0.008+0.055*lossRateA)*(0.65+0.35*attackerEquipment)*(1+armorA*0.8))),equipmentLossB=Math.min(i.defender.equipment,Math.round(i.defender.equipment*(0.008+0.055*lossRateB)*(0.65+0.35*defenderEquipment)*(1+armorB*0.8)));
  const fireA=clamp(0.20+0.45*artilleryA+0.25*airA+0.10*armorA),fireB=clamp(0.20+0.45*artilleryB+0.25*airB+0.10*armorB),intensityA=clamp(0.25+0.45*lossRateA+0.15*artilleryA+0.10*airA+0.10*Math.abs(maneuver)),intensityB=clamp(0.25+0.45*lossRateB+0.15*artilleryB+0.10*airB);
  const attackerSuppression=clamp(WW2_COMBAT_COEFFICIENTS.suppressionBase+WW2_COMBAT_COEFFICIENTS.suppressionFireWeight*fireB+WW2_COMBAT_COEFFICIENTS.suppressionLossWeight*lossRateB+0.05*Math.max(-surprise,0)),defenderSuppression=clamp(WW2_COMBAT_COEFFICIENTS.suppressionBase+WW2_COMBAT_COEFFICIENTS.suppressionFireWeight*fireA+WW2_COMBAT_COEFFICIENTS.suppressionLossWeight*lossRateA+0.05*Math.max(surprise,0)),attackerDisorganization=clamp(WW2_COMBAT_COEFFICIENTS.disorganizationBase+WW2_COMBAT_COEFFICIENTS.disorganizationSuppressionWeight*attackerSuppression+WW2_COMBAT_COEFFICIENTS.disorganizationLossWeight*lossRateA+0.04*Math.max(-command,0)),defenderDisorganization=clamp(WW2_COMBAT_COEFFICIENTS.disorganizationBase+WW2_COMBAT_COEFFICIENTS.disorganizationSuppressionWeight*defenderSuppression+WW2_COMBAT_COEFFICIENTS.disorganizationLossWeight*lossRateB+0.04*Math.max(command,0));
  const ammoDeltaA=-Math.min(i.attacker.ammunition,0.010+0.035*intensityA+0.010*artilleryA+0.006*airA),ammoDeltaB=-Math.min(i.defender.ammunition,0.010+0.035*intensityB+0.010*artilleryB+0.006*airB),fuelDeltaA=-Math.min(i.attacker.fuel,0.003+0.012*intensityA+0.010*armorA+0.008*Math.max(maneuver,0)),fuelDeltaB=-Math.min(i.defender.fuel,0.003+0.012*intensityB+0.010*armorB),readinessA=-clamp(0.008+0.20*lossRateA+0.025*intensityA+0.04*attackerSuppression,0,0.30),readinessB=-clamp(0.008+0.20*lossRateB+0.025*intensityB+0.04*defenderSuppression,0,0.30),moraleA=-clamp(0.004+0.16*lossRateA+0.025*intensityA+0.03*Math.max(-surprise,0),0,0.25),moraleB=-clamp(0.004+0.16*lossRateB+0.025*intensityB+0.03*Math.max(surprise,0),0,0.25);
  const attackerMobility=mobility(i.attacker,attackerArmor,attackerEquipment),defenderMobility=mobility(i.defender,defenderArmor,defenderEquipment),attackerScore=alpha*A0*(1-attackerSuppression)*(1-attackerDisorganization)*(0.65+0.35*attackerMobility),defenderScore=beta*B0*(1-defenderSuppression)*(1-defenderDisorganization)*(0.65+0.35*defenderMobility)*terrain,localRatio=attackerScore/Math.max(defenderScore,1e-9),attackerCanExploit=attackerMobility>defenderMobility+0.08&&maneuver>-0.05&&command>-0.20;
  let outcome:WW2CombatOutcome;if(localRatio<0.65)outcome='attacker_repulsed';else if(localRatio<0.95)outcome='attacker_stalls';else if(localRatio<1.35)outcome='local_gain';else if(attackerCanExploit&&localRatio>=1.75&&defenderDisorganization>=0.15)outcome='breakthrough';else if(attackerCanExploit&&localRatio>=1.35&&defenderDisorganization>=0.10)outcome='penetration';else if(i.defender.order?.type==='withdraw'||defenderDisorganization>=0.45)outcome='defender_withdraws';else outcome='local_gain';
  return {attackerLosses:la,defenderLosses:lb,attackerEquipmentLosses:equipmentLossA,defenderEquipmentLosses:equipmentLossB,attackerAmmunitionDelta:ammoDeltaA,defenderAmmunitionDelta:ammoDeltaB,attackerFuelDelta:fuelDeltaA,defenderFuelDelta:fuelDeltaB,attackerReadinessDelta:readinessA,defenderReadinessDelta:readinessB,attackerMoraleDelta:moraleA,defenderMoraleDelta:moraleB,attackerSuppressionDelta:attackerSuppression,defenderSuppressionDelta:defenderSuppression,attackerDisorganizationDelta:attackerDisorganization,defenderDisorganizationDelta:defenderDisorganization,attackerEffectiveness:1-Math.exp(-alpha*A0*A0/Math.max(B0,1)),defenderEffectiveness:1-Math.exp(-beta*B0*B0/Math.max(A0,1)),outcome,phase,factors:{attackerQuality:aq,defenderQuality:dq,ammoA,ammoB,sustainA,sustainB,wearA,wearB,fatigueA,fatigueB,weather,terrain,surprise,distanceKm,rangeA,rangeB,armorA,armorB,antiArmorA,antiArmorB,artilleryA,artilleryB,airA,airB,maneuver,command,attackerEquipment,defenderEquipment,frontA,frontB,engagedA,engagedB,densityA,densityB,densityRatioA,densityRatioB,reserveA,reserveB,attackerMobility,defenderMobility,attackerSuppression,defenderSuppression,attackerDisorganization,defenderDisorganization,localRatio,lossRateA,lossRateB}};
}

import type { EraId } from './types';
export type CombatLaw='linear'|'mixed'|'new-square'|'square'|'contemporary-hybrid'|'extended-square';
export interface EraRuleset { id:EraId; label:string; combatLaw:CombatLaw; rangedFire:boolean; spatialModel:'none'|'pde'|'pde-hybrid'; defaultTurnHours:number; equipmentCrewCoupling:boolean; permanentAttrition:boolean; logisticsEnabled:boolean; notes:string[]; }
const base=(id:EraId,label:string,combatLaw:CombatLaw,turn:number):EraRuleset=>({id,label,combatLaw,rangedFire:true,spatialModel:'pde-hybrid',defaultTurnHours:turn,equipmentCrewCoupling:true,permanentAttrition:true,logisticsEnabled:true,notes:[]});
export const ERA_RULESETS:Record<EraId,EraRuleset>={
 ancient:{...base('ancient','Ancient','linear',24),rangedFire:false,spatialModel:'pde',notes:['Intermittent combat; qualitative cohesion and morale modifiers.']},
 medieval:{...base('medieval','Medieval','mixed',12),spatialModel:'pde',notes:['Mixed close-combat and missile effects; siege-aware terrain.']},
 'early-modern':{...base('early-modern','Early Modern','new-square',12),notes:['Pike-and-shot and gunpowder transition; fortification effects.']},
 industrial:{...base('industrial','Industrial','square',6),notes:['Industrial-era mass fire, logistics and mechanized precursors.']},
 ww1:{...base('ww1','World War I','square',6),notes:['Entrenchment, artillery concentration and attritional operations.']},
 interwar:{...base('interwar','Interwar','square',6),notes:['Mechanization, airpower and doctrinal transition.']},
 ww2:{...base('ww2','World War II','square',6),notes:['Combined arms, operational maneuver and high-tempo logistics.']},
 'early-cold-war':{...base('early-cold-war','Early Cold War','square',3),notes:['Mechanized combined arms and high-intensity conventional operations.']},
 'late-cold-war':{...base('late-cold-war','Late Cold War','square',3),notes:['Advanced mechanized warfare, ISR and air-defense integration.']},
 'post-cold-war':{...base('post-cold-war','Post-Cold War','contemporary-hybrid',3),notes:['Precision fires, ISR and asymmetric operations.']},
 contemporary:{...base('contemporary','Contemporary','contemporary-hybrid',1),notes:['Networked, multi-domain and asymmetric operations.']},
 future:{...base('future','Future','extended-square',1),notes:['Hypothetical multi-domain/AI systems; assumptions must be scenario-defined.']}
};
export function getEraRuleset(id:EraId):EraRuleset{return ERA_RULESETS[id];}
export function validateEraRuleset(r:EraRuleset):string[]{const e:string[]=[];if(!r.id||!r.label)e.push('Era ruleset requires id and label');if(r.defaultTurnHours<=0)e.push('defaultTurnHours must be positive');if(r.permanentAttrition!==true)e.push('permanentAttrition must remain enabled for DWST accounting');return e;}

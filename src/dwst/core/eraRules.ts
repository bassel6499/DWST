export type EraId='ancient'|'medieval'|'early-modern'|'ww1'|'ww2'|'cold-war'|'post-cold-war'|'contemporary'|'future';
export type CombatLaw='linear'|'mixed'|'new-square'|'square'|'contemporary-hybrid'|'extended-square';
export interface EraRuleset { id:EraId; label:string; combatLaw:CombatLaw; rangedFire:boolean; spatialModel:'none'|'pde'|'pde-hybrid'; defaultTurnHours:number; equipmentCrewCoupling:boolean; permanentAttrition:boolean; logisticsEnabled:boolean; notes:string[]; }

const base=(id:EraId,label:string,combatLaw:CombatLaw,turn:number):EraRuleset=>({id,label,combatLaw,rangedFire:true,spatialModel:'pde-hybrid',defaultTurnHours:turn,equipmentCrewCoupling:true,permanentAttrition:true,logisticsEnabled:true,notes:[]});

export const ERA_RULESETS:Record<EraId,EraRuleset>={
 ancient:{...base('ancient','Ancient','linear',24),rangedFire:false,spatialModel:'pde',notes:['Intermittent combat; qualitative cohesion and morale modifiers.']},
 medieval:{...base('medieval','Medieval','mixed',12),spatialModel:'pde',notes:['Mixed close-combat and missile effects; siege-aware terrain.']},
 'early-modern':{...base('early-modern','Early Modern','new-square',12),notes:['Pike-and-shot/gunpowder transition; fortification effects.']},
 ww1:{...base('ww1','World War I','square',6),notes:['Entrenchment, artillery concentration and attritional operations.']},
 ww2:{...base('ww2','World War II','square',6),notes:['Combined arms, operational maneuver and high-tempo logistics.']},
 'cold-war':{...base('cold-war','Cold War','square',3),notes:['Mechanized combined arms, air defense and high-intensity conventional operations.']},
 'post-cold-war':{...base('post-cold-war','Post-Cold War','contemporary-hybrid',3),notes:['Precision fires, ISR and asymmetric operations.']},
 contemporary:{...base('contemporary','Contemporary','contemporary-hybrid',1),notes:['Multi-domain, networked and asymmetric operations.']},
 future:{...base('future','Future','extended-square',1),notes:['Hypothetical multi-domain/AI systems; scenario-defined assumptions required.']}
};

export function getEraRuleset(id:EraId):EraRuleset{return ERA_RULESETS[id];}
export function validateEraRuleset(r:EraRuleset):string[]{const e:string[]=[];if(!r.id||!r.label)e.push('Era ruleset requires id and label');if(r.defaultTurnHours<=0)e.push('defaultTurnHours must be positive');if(r.permanentAttrition!==true)e.push('permanentAttrition must remain enabled for DWST accounting');return e;}

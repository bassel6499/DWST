/**
 * Public DWST API boundary.
 *
 * Consumers should import DWST contracts and entry points from this module
 * rather than depending on internal Core file paths. Scenario definitions and
 * presentation components remain outside this public simulation boundary.
 */
export { startCanonicalSimulation, advanceCanonicalSimulation, type CanonicalSimulationSession, type CanonicalSimulationSessionStepResult } from './core/canonicalSimulationSession';
export { formatSimulationReport } from './core/reportFormatter';
export type { CanonicalState } from './core/canonicalState';
export type { CombatContext, CombatUnitContext, CombatContextProvider } from './core/combatContext';
export type { CombatAllocationPolicy, CombatLossCounts } from './core/canonicalCombatAllocation';
export { getEraRuleset, getImplementedEraRulesets, validateEraRuleset, ERA_RULESETS, DEFAULT_ENGINE, DEFAULT_DETECTION_POLICY, type EraRuleset, type EngineCoefficients, type UnitAssessmentPolicy, type DetectionPolicy, type DetectionSensorType, type CombatResolver, type CombatResult, type CombatLaw } from './core/eraRules';
export { validateScenario } from './core/scenarioValidation';
export { parseNaturalLanguageOrder, type ParsedOrder } from './core/orderProcessor';
export { resolveScenarioLocation, resolveOrderDestination } from './core/scenarioLocations';
export { scenarioToGeoJSON, type DwstMapFeature } from './core/mapState';
export { isWorldPosition, type WorldPosition, type ScenarioSpatialReference } from './core/spatialPosition';
export { contentHash, getRulesetContentHash, createReplayProvenance, type ReplayProvenance, type ReplayCommand } from './core/replayProvenance';
export { DWST_SERIALIZATION_VERSION, serializeScenarioState, deserializeScenarioState, serializeCanonicalState, deserializeCanonicalState, serializeReplayProvenance, deserializeReplayProvenance } from './core/serialization';
export { type EraId, type Scale, type Side, type UnitStatus, type UnitState, type Order, type ScenarioLocation, type Sensor, type SensorType, type ScenarioState, type UnitEvent, type SimulationEvent, type SimulationReport } from './core/types';

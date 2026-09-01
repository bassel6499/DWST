/** Canonical physical location used by DWST and the host map.
 *
 * Coordinates are geographic longitude/latitude in degrees, matching the
 * existing scenario/map representation. Local battlefield coordinates are
 * deliberately not stored here; they must be derived from this world point
 * through an explicit scenario spatial reference.
 */
export interface WorldPosition {
  lon: number;
  lat: number;
}

/** Scenario-defined relationship between the world map and simulation space.
 *
 * This is a contract only. It does not prescribe a projection or conversion
 * algorithm; those must be selected from verified scenario requirements.
 */
export interface ScenarioSpatialReference {
  /** Identifier for the geographic CRS used by the scenario/map. */
  geographicCrs: string;
  /** Optional identifier for a scenario-local computational CRS. */
  simulationCrs?: string;
  /** Optional explicit origin for a local simulation frame, in world coordinates. */
  origin?: WorldPosition;
}

export function isWorldPosition(value: unknown): value is WorldPosition {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.lon === 'number'
    && Number.isFinite(candidate.lon)
    && typeof candidate.lat === 'number'
    && Number.isFinite(candidate.lat)
    && candidate.lon >= -180
    && candidate.lon <= 180
    && candidate.lat >= -90
    && candidate.lat <= 90;
}

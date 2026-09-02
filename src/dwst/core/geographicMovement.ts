import type { WorldPosition } from './spatialPosition';

const EARTH_RADIUS_METERS = 6_371_008.8;
const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;

function normalizeLongitude(lon: number): number { return ((lon + 540) % 360) - 180; }

export function interpolateGeographicPosition(start: WorldPosition, destination: WorldPosition, fraction: number): WorldPosition {
  const t = Math.min(1, Math.max(0, fraction));
  if (t === 0) return { ...start };
  if (t === 1) return { ...destination };
  const lat1 = start.lat * DEGREES_TO_RADIANS;
  const lon1 = start.lon * DEGREES_TO_RADIANS;
  const lat2 = destination.lat * DEGREES_TO_RADIANS;
  const lon2 = destination.lon * DEGREES_TO_RADIANS;
  const cosAngle = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  const angle = Math.acos(Math.min(1, Math.max(-1, cosAngle)));
  if (angle < 1e-12) return { ...destination };
  const sinAngle = Math.sin(angle);
  const startWeight = Math.sin((1 - t) * angle) / sinAngle;
  const destinationWeight = Math.sin(t * angle) / sinAngle;
  const x = startWeight * Math.cos(lat1) * Math.cos(lon1) + destinationWeight * Math.cos(lat2) * Math.cos(lon2);
  const y = startWeight * Math.cos(lat1) * Math.sin(lon1) + destinationWeight * Math.cos(lat2) * Math.sin(lon2);
  const z = startWeight * Math.sin(lat1) + destinationWeight * Math.sin(lat2);
  return { lon: normalizeLongitude(Math.atan2(y, x) * RADIANS_TO_DEGREES), lat: Math.atan2(z, Math.hypot(x, y)) * RADIANS_TO_DEGREES };
}

/** Initial great-circle bearing from start to destination, in degrees clockwise from north. */
export function geographicBearingDegrees(start: WorldPosition, destination: WorldPosition): number {
  const lat1 = start.lat * DEGREES_TO_RADIANS;
  const lat2 = destination.lat * DEGREES_TO_RADIANS;
  const dLon = (destination.lon - start.lon) * DEGREES_TO_RADIANS;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * RADIANS_TO_DEGREES + 360) % 360;
}

/** Move along a great-circle initial bearing by a physical distance in metres. */
export function displaceGeographicPosition(start: WorldPosition, bearingDegrees: number, distanceMeters: number): WorldPosition {
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;
  const bearing = bearingDegrees * DEGREES_TO_RADIANS;
  const lat1 = start.lat * DEGREES_TO_RADIANS;
  const lon1 = start.lon * DEGREES_TO_RADIANS;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing));
  const lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1), Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: lat2 * RADIANS_TO_DEGREES, lon: normalizeLongitude(lon2 * RADIANS_TO_DEGREES) };
}

export function geographicDistanceMeters(start: WorldPosition, destination: WorldPosition): number {
  const lat1 = start.lat * DEGREES_TO_RADIANS;
  const lat2 = destination.lat * DEGREES_TO_RADIANS;
  const dLat = (destination.lat - start.lat) * DEGREES_TO_RADIANS;
  const dLon = (destination.lon - start.lon) * DEGREES_TO_RADIANS;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return EARTH_RADIUS_METERS * centralAngle;
}

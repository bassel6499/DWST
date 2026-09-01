import { describe, expect, it } from 'vitest';
import { geographicDistanceMeters, interpolateGeographicPosition } from './geographicMovement';

describe('canonical geographic movement', () => {
  const start = { lon: 35.5, lat: 33.9 };
  const destination = { lon: 36.5, lat: 34.9 };

  it('returns the exact start position at zero progress', () => {
    expect(interpolateGeographicPosition(start, destination, 0)).toEqual(start);
  });

  it('returns the exact destination at full progress', () => {
    expect(interpolateGeographicPosition(start, destination, 1)).toEqual(destination);
  });

  it('clamps progress outside the supported range', () => {
    expect(interpolateGeographicPosition(start, destination, -1)).toEqual(start);
    expect(interpolateGeographicPosition(start, destination, 2)).toEqual(destination);
  });

  it('returns an intermediate valid geographic position', () => {
    const midpoint = interpolateGeographicPosition(start, destination, 0.5);
    expect(midpoint.lat).toBeGreaterThan(-90);
    expect(midpoint.lat).toBeLessThan(90);
    expect(midpoint.lon).toBeGreaterThanOrEqual(-180);
    expect(midpoint.lon).toBeLessThan(180);
    expect(geographicDistanceMeters(start, midpoint)).toBeGreaterThan(0);
    expect(geographicDistanceMeters(midpoint, destination)).toBeGreaterThan(0);
  });

  it('takes the short route across the antimeridian', () => {
    const west = { lon: 179, lat: 0 };
    const east = { lon: -179, lat: 0 };
    const midpoint = interpolateGeographicPosition(west, east, 0.5);
    expect(Math.abs(midpoint.lon)).toBeGreaterThan(170);
    expect(Math.abs(midpoint.lat)).toBeLessThan(1e-9);
  });

  it('returns zero distance for the same geographic position', () => {
    expect(geographicDistanceMeters(start, start)).toBeCloseTo(0, 9);
  });

  it('produces a plausible one-degree equatorial distance', () => {
    const distance = geographicDistanceMeters({ lon: 0, lat: 0 }, { lon: 1, lat: 0 });
    expect(distance).toBeGreaterThan(111_000);
    expect(distance).toBeLessThan(112_000);
  });
});

import { describe, expect, it } from 'vitest';
import { isWorldPosition } from './spatialPosition';

describe('WorldPosition contract', () => {
  it('accepts finite geographic longitude/latitude', () => {
    expect(isWorldPosition({ lon: 35.5, lat: 33.9 })).toBe(true);
  });

  it('rejects invalid geographic bounds', () => {
    expect(isWorldPosition({ lon: 181, lat: 33.9 })).toBe(false);
    expect(isWorldPosition({ lon: 35.5, lat: -91 })).toBe(false);
  });

  it('rejects non-finite or malformed values', () => {
    expect(isWorldPosition({ lon: Number.NaN, lat: 33.9 })).toBe(false);
    expect(isWorldPosition({ x: 10, y: 20 })).toBe(false);
    expect(isWorldPosition(null)).toBe(false);
  });
});

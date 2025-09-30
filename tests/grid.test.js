import { describe, it, expect } from 'vitest';
import { gridFromPositions } from '../src/lib/grid.js';

describe('gridFromPositions', () => {
  it('returns a 3x5 grid shape', () => {
    const g = gridFromPositions([0, 0, 0, 0, 0]);
    expect(g.length).toBe(3);
    expect(g[0].length).toBe(5);
  });

  it('wraps around bands without crashing', () => {
    const g = gridFromPositions([19, 0, 0, 0, 0]);
    expect(Array.isArray(g[0])).toBe(true);
    expect(g[0].length).toBe(5);
  });
});

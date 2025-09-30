import { BANDS } from '../constants/bands.js';

export const COLS = 5;
export const ROWS = 3;

/**
 * Build the visible 3x5 grid from reel positions.
 * positions[c] = index of TOP symbol on reel c (wrap around).
 * Row indices: 0=top, 1=middle, 2=bottom.
 */
export function gridFromPositions(positions) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
  for (let c = 0; c < COLS; c++) {
    const band = BANDS[c];
    const base = ((positions[c] % band.length) + band.length) % band.length; // safe modulo
    for (let r = 0; r < ROWS; r++) {
      grid[r][c] = band[(base + r) % band.length];
    }
  }
  return grid;
}

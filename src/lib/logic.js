// src/lib/logic.js
import { BANDS } from '../constants/bands.js';
import { PAYLINES } from '../constants/paylines.js';
import { PAY } from '../constants/paytable.js';

export const COLS = 5;
export const ROWS = 3;

/**
 * Build a 3×5 symbol grid from reel top positions.
 * positions[c] is the top index on BANDS[c]; visible rows are (base, base+1, base+2).
 */
export function gridFromPositions(positions) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
  for (let c = 0; c < COLS; c++) {
    const band = BANDS[c];
    if (!band) throw new Error(`Missing band for column ${c}`);
    const base = ((positions[c] % band.length) + band.length) % band.length;
    for (let r = 0; r < ROWS; r++) {
      grid[r][c] = band[(base + r) % band.length];
    }
  }
  return grid;
}

/**
 * Evaluate paylines left→right starting at column 0.
 * Returns { total, lines } where lines are formatted like:
 *   "- payline <id>, <symbol> x<count>, <payout>"
 */
export function evaluateWins(grid) {
  let total = 0;
  const lines = [];
  for (let i = 0; i < PAYLINES.length; i++) {
    const rows = PAYLINES[i];
    const firstSym = grid[rows[0]][0];
    let run = 1;
    for (let col = 1; col < COLS; col++) {
      if (grid[rows[col]][col] === firstSym) run++;
      else break;
    }
    if (run >= 3) {
      const payout = PAY[firstSym]?.[run] || 0;
      if (payout > 0) {
        total += payout;
        lines.push(`- payline ${i + 1}, ${firstSym} x${run}, ${payout}`);
      }
    }
  }
  return { total, lines };
}

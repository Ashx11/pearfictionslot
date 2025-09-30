import { describe, it, expect } from 'vitest';
import { gridFromPositions, evaluateWins, COLS, ROWS } from '../src/lib/logic.js';

const grid = (rows) => rows.map((r) => r.slice());

describe('evaluateWins – payout table sanity', () => {
  it('pays 3/4/5-of-a-kind correctly for hv1 on middle line', () => {
    // Payline 1 (middle row): indices [1,1,1,1,1]
    // 3-in-a-row
    let g = grid([
      ['x', 'x', 'x', 'x', 'x'],
      ['hv1', 'hv1', 'hv1', 'lv1', 'lv2'],
      ['x', 'x', 'x', 'x', 'x'],
    ]);
    expect(evaluateWins(g)).toEqual({
      total: 10,
      lines: ['- payline 1, hv1 x3, 10'],
    });

    // 4-in-a-row
    g = grid([
      ['x', 'x', 'x', 'x', 'x'],
      ['hv1', 'hv1', 'hv1', 'hv1', 'lv2'],
      ['x', 'x', 'x', 'x', 'x'],
    ]);
    expect(evaluateWins(g)).toEqual({
      total: 20,
      lines: ['- payline 1, hv1 x4, 20'],
    });

    // 5-in-a-row
    g = grid([
      ['x', 'x', 'x', 'x', 'x'],
      ['hv1', 'hv1', 'hv1', 'hv1', 'hv1'],
      ['x', 'x', 'x', 'x', 'x'],
    ]);
    expect(evaluateWins(g)).toEqual({
      total: 50,
      lines: ['- payline 1, hv1 x5, 50'],
    });
  });

  it('does NOT pay for only 2 in a row', () => {
    const g = grid([
      ['x', 'x', 'x', 'x', 'x'],
      ['lv2', 'lv2', 'hv1', 'lv2', 'lv2'],
      ['x', 'x', 'x', 'x', 'x'],
    ]);
    expect(evaluateWins(g)).toEqual({ total: 0, lines: [] });
  });
});

describe('evaluateWins – first-reel rule and early stop', () => {
  it('requires the run to start at column 0', () => {
    // Middle row: starts with hv4, then three lv1s — should NOT pay
    const g = grid([
      ['x', 'x', 'x', 'x', 'x'],
      ['hv4', 'lv1', 'lv1', 'lv1', 'hv4'],
      ['x', 'x', 'x', 'x', 'x'],
    ]);
    expect(evaluateWins(g)).toEqual({ total: 0, lines: [] });
  });

  it('stops counting at first mismatch even if later columns match again', () => {
    // Middle row: lv1, lv1, mismatch (hv2), then lv1, lv1
    const g = grid([
      ['x', 'x', 'x', 'x', 'x'],
      ['lv1', 'lv1', 'hv2', 'lv1', 'lv1'],
      ['x', 'x', 'x', 'x', 'x'],
    ]);
    expect(evaluateWins(g)).toEqual({ total: 0, lines: [] });
  });
});

describe('evaluateWins – multiple paylines can win simultaneously', () => {
  it('pays all paylines independently (full board of lv1)', () => {
    const g = grid([
      ['lv1', 'lv1', 'lv1', 'lv1', 'lv1'],
      ['lv1', 'lv1', 'lv1', 'lv1', 'lv1'],
      ['lv1', 'lv1', 'lv1', 'lv1', 'lv1'],
    ]);
    const res = evaluateWins(g);
    // 7 paylines, each lv1 x5 => 10 payout
    expect(res.total).toBe(7 * 10);
    expect(res.lines.length).toBe(7);
    expect(res.lines[0]).toBe('- payline 1, lv1 x5, 10');
    expect(res.lines[6]).toBe('- payline 7, lv1 x5, 10');
  });
});

describe('gridFromPositions – wrapping & bounds', () => {
  it('wraps negative and large positions cleanly (mod band length)', () => {
    const positions = [-1, 41, 20, -21, 9999];
    const g = gridFromPositions(positions);
    expect(g.length).toBe(ROWS);
    expect(g[0].length).toBe(COLS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        expect(typeof g[r][c]).toBe('string');
        expect(g[r][c].length).toBeGreaterThan(0);
      }
    }
  });
});

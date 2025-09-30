import * as PIXI from 'pixi.js';
import { BANDS } from '../constants/bands.js';
import { PAYLINES } from '../constants/paylines.js';
import { gridFromPositions, evaluateWins } from '../lib/logic.js';
import { winTheme, panelThemeForState } from './ui/theme.js';
import {
  createBackground,
  createRoot,
  createReelsPanel,
  createLayers,
  drawBackground,
  drawReelsPanel,
  drawReelsMask,
} from './ui/layers.js';
import { createSpinButton } from './ui/spinButton.js';
import { createWinsPanel } from './ui/winsPanel.js';
import { redrawPaylineOverlay } from './ui/paylines.js';
import { makeHighlighter } from './ui/highlight.js';
import { computeLayout, applyLayoutToSprites } from './ui/layoutManager.js';
import { createReelsGrid, updateReelsGrid } from './ui/reelsGrid.js';
import { createTitle, layoutTitle } from "./ui/title.js";

const PROFILE_LANDSCAPE = {
  W: 1280,
  H: 720,
  SIDE_MARGIN: 80,
  TOP_MARGIN: 60,
  BOTTOM_MARGIN: 48,
  GAP: 20,
  INNER_PADDING_FR: 0.08,
  BTN_SIZE: 110,
  SPACE_BELOW_REELS: 16,
  SPACE_BELOW_BTN: 18,
  WINS_MIN_H: 100,
  WINS_MAX_H: 160,
};
const PROFILE_PORTRAIT = {
  W: 720,
  H: 1280,
  SIDE_MARGIN: 32,
  TOP_MARGIN: 52,
  BOTTOM_MARGIN: 32,
  GAP: 16,
  INNER_PADDING_FR: 0.08,
  BTN_SIZE: 100,
  SPACE_BELOW_REELS: 14,
  SPACE_BELOW_BTN: 14,
  WINS_MIN_H: 110,
  WINS_MAX_H: 200,
};

const REELS_COLS = 5;
const REELS_ROWS = 3;
const INITIAL_POSITIONS = [0, 0, 0, 0, 0];

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickProfile(vw, vh) {
  const aspect = vw / Math.max(1, vh);
  return aspect < 0.85 ? PROFILE_PORTRAIT : PROFILE_LANDSCAPE;
}

export function createGameScene(app) {
  const bg = createBackground(app.stage);
  const gameRoot = createRoot(app.stage);
  const reelsPanel = createReelsPanel(gameRoot);
  const { reelsLayer, uiLayer, highlightLayer, paylinesLayer, reelsMask } = createLayers(gameRoot);
  const spritesGrid = createReelsGrid(reelsLayer, REELS_ROWS, REELS_COLS);
  const textureFor = (key) => {
    const tex = PIXI.Assets.get(key);
    if (!tex) console.warn(`Texture '${key}' missing; check loader bundle keys.`);
    return tex;
  };
  const wins = createWinsPanel(uiLayer);
  const title = createTitle(uiLayer, 'Pearfiction Slot Machine');

  let profile = PROFILE_LANDSCAPE;
  let designW = profile.W;
  let designH = profile.H;
  let layout = computeLayout(profile, REELS_COLS, REELS_ROWS, designW, designH);
  let panelState = 'ready';
  let currentPanel = panelThemeForState(panelState);
  const highlighter = makeHighlighter(app, spritesGrid, highlightLayer);

  function applyLayout(vw, vh) {
    profile = pickProfile(vw, vh);
    title.position.set(designW / 2, Math.max(8, profile.TOP_MARGIN - 56));

    designW = profile.W;
    designH = profile.H;
    layoutTitle(title, designW, profile, -14);
    layout = computeLayout(profile, REELS_COLS, REELS_ROWS, designW, designH);
    drawReelsPanel(
      reelsPanel,
      layout.reelsX - layout.panelPad,
      layout.reelsY - layout.panelPad,
      layout.totalW + layout.panelPad * 2,
      layout.totalH + layout.panelPad * 2,
    );
    drawReelsMask(reelsMask, layout.reelsX, layout.reelsY, layout.totalW, layout.totalH);
    wins.setBox(layout.winsBox);
    wins.drawPanel(currentPanel.panel, currentPanel.panelA);
    applyLayoutToSprites(spritesGrid, layout, profile.GAP);
    redrawPaylineOverlay(paylinesLayer, [], {
      cellSize: layout.CELL,
      gap: profile.GAP,
      reelsX: layout.reelsX,
      reelsY: layout.reelsY,
    });
  }

  let spinBtn = null;
  function ensureSpinButton() {
    const centerX = designW / 2;
    const size = profile.BTN_SIZE;
    const y = layout.BTN_Y;
    if (!spinBtn) {
      spinBtn = createSpinButton(uiLayer, textureFor, size, centerX, y, spin);
    } else {
      spinBtn.width = size;
      spinBtn.height = size;
      spinBtn.position.set(centerX, y + size / 2);
    }
  }

  function winningLinesFrom(grid) {
    const wins = [];
    for (let i = 0; i < PAYLINES.length; i++) {
      const rows = PAYLINES[i];
      const sym = grid[rows[0]][0];
      let count = 1;
      for (let c = 1; c < REELS_COLS; c++) {
        if (grid[rows[c]][c] === sym) count++;
        else break;
      }
      if (count >= 3) {
        const cells = [];
        for (let c = 0; c < count; c++) cells.push({ r: rows[c], c });
        wins.push({ lineIndex: i, cells });
      }
    }
    return wins;
  }

  function setWinningsText(positions, grid, result, { showEffects = true } = {}) {
    const lines = [
      `Positions: ${positions.join(', ')}`,
      'Screen:',
      ...grid.map((row) => '  ' + row.join(' ')),
      '',
      `Total wins: ${result.total}`,
      ...result.lines,
    ];
    wins.setText(lines.join('\n'));
    wins.fitHeight(app);
    if (!showEffects) {
      panelState = 'ready';
    } else if (result.total <= 0) {
      panelState = 'loss';
    } else if (result.total >= 20) {
      panelState = 'jackpot';
    } else {
      panelState = 'win';
    }
    currentPanel = panelThemeForState(panelState);
    wins.drawPanel(currentPanel.panel, currentPanel.panelA);
    if (!showEffects) {
      redrawPaylineOverlay(paylinesLayer, [], {
        cellSize: layout.CELL,
        gap: profile.GAP,
        reelsX: layout.reelsX,
        reelsY: layout.reelsY,
      });
      highlighter.clear();
    } else {
      const theme = winTheme(result.total);
      if (result.total > 0) {
        const winningLines = winningLinesFrom(grid);
        redrawPaylineOverlay(paylinesLayer, winningLines, {
          cellSize: layout.CELL,
          gap: profile.GAP,
          reelsX: layout.reelsX,
          reelsY: layout.reelsY,
          color: theme.line,
          alpha: 0.38,
        });
        const cells = winningLines.flatMap((w) => w.cells);
        highlighter.flash(cells, {
          pulseColor: theme.pulse,
          cellSize: layout.CELL,
          gap: profile.GAP,
          reelsX: layout.reelsX,
          reelsY: layout.reelsY,
        });
      } else {
        redrawPaylineOverlay(paylinesLayer, [], {
          cellSize: layout.CELL,
          gap: profile.GAP,
          reelsX: layout.reelsX,
          reelsY: layout.reelsY,
        });
        highlighter.clear();
      }
    }
    const sr = document.getElementById('sr-wins');
    if (sr) sr.textContent = lines.join(' ').replace(/\n+/g, ' ');
  }

  let positions = INITIAL_POSITIONS.slice();
  const rng = mulberry32(0xc0ffee);
  let hasSpun = false;
  let spinning = false;

  const spin = () => {
    if (spinning) return;
    spinning = true;
    if (spinBtn) spinBtn.alpha = 0.85;
    highlighter.clear();
    positions = positions.map((_, c) => Math.floor(rng() * BANDS[c].length));
    const grid = gridFromPositions(positions);
    updateReelsGrid(spritesGrid, grid, Math.max(0, layout.CELL - layout.PADDING * 2), (id) =>
      PIXI.Assets.get(id),
    );
    setWinningsText(positions, grid, evaluateWins(grid), { showEffects: true });
    if (spinBtn) spinBtn.alpha = 1;
    spinning = false;
    hasSpun = true;
  };

  function onKey(e) {
    if (e.code === 'Space' || e.code === 'Enter') spin();
  }
  window.addEventListener('keydown', onKey);

  function resize() {
    const { width: vw, height: vh } = app.renderer.screen;
    drawBackground(bg, vw, vh);
    applyLayout(vw, vh);
    ensureSpinButton();
    const stageScale = Math.min(vw / designW, vh / designH);
    gameRoot.scale.set(stageScale);
    gameRoot.position.set((vw - designW * stageScale) / 2, (vh - designH * stageScale) / 2);
    wins.fitHeight(app);
    if (!hasSpun) {
      redrawPaylineOverlay(paylinesLayer, [], {
        cellSize: layout.CELL,
        gap: profile.GAP,
        reelsX: layout.reelsX,
        reelsY: layout.reelsY,
      });
      highlighter.clear();
    }
  }

  resize();

  const firstGrid = gridFromPositions(positions);
  updateReelsGrid(spritesGrid, firstGrid, Math.max(0, layout.CELL - layout.PADDING * 2), (id) =>
    PIXI.Assets.get(id),
  );
  setWinningsText(positions, firstGrid, evaluateWins(firstGrid), {
    showEffects: false,
  });

  window.addEventListener('resize', resize);

  function destroy() {
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onKey);
    redrawPaylineOverlay(paylinesLayer, [], {
      cellSize: layout.CELL,
      gap: profile.GAP,
      reelsX: layout.reelsX,
      reelsY: layout.reelsY,
    });
    highlighter.clear();
    gameRoot.destroy({ children: true });
    bg.destroy(true);
  }
  return { destroy };
}

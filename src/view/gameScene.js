import * as PIXI from "pixi.js";
import { BANDS } from "../constants/bands.js";
import { PAYLINES } from "../constants/paylines.js";
import { PAY } from "../constants/paytable.js";

const PROFILE_LANDSCAPE = {
  W: 1280, H: 720,
  SIDE_MARGIN: 80, TOP_MARGIN: 60, BOTTOM_MARGIN: 40,
  GAP: 20, INNER_PADDING_FR: 0.08,
  BTN_SIZE: 110, SPACE_BELOW_REELS: 8, SPACE_BELOW_BTN: 16,
  WINS_MIN_H: 120,
};

const PROFILE_PORTRAIT = {
  W: 720, H: 1280,
  SIDE_MARGIN: 32, TOP_MARGIN: 44, BOTTOM_MARGIN: 28,
  GAP: 16, INNER_PADDING_FR: 0.08,
  BTN_SIZE: 96, SPACE_BELOW_REELS: 8, SPACE_BELOW_BTN: 12,
  WINS_MIN_H: 120,
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
  const gameRoot = new PIXI.Container();
  app.stage.addChild(gameRoot);

  const reelsLayer = new PIXI.Container();
  const uiLayer = new PIXI.Container();
  gameRoot.addChild(reelsLayer, uiLayer);

  const reelsMask = new PIXI.Graphics();
  reelsLayer.mask = reelsMask;
  gameRoot.addChild(reelsMask);

  const spritesGrid = Array.from({ length: REELS_ROWS }, () =>
    Array.from({ length: REELS_COLS }, () => {
      const sp = new PIXI.Sprite();
      sp.anchor.set(0.5);
      reelsLayer.addChild(sp);
      return sp;
    })
  );

  const textureFor = (key) => {
    const tex = PIXI.Assets.get(key);
    if (!tex) console.warn(`Texture '${key}' missing; check loader bundle keys.`);
    return tex;
  };

  const spinBtn = new PIXI.Sprite(textureFor("spin"));
  spinBtn.anchor.set(0.5);
  spinBtn.eventMode = "static";
  spinBtn.cursor = "pointer";
  uiLayer.addChild(spinBtn);

  const winsText = new PIXI.Text({
    text: "",
    style: new PIXI.TextStyle({
      fill: 0x000000,
      fontFamily: "Arial",
      fontWeight: "600",
      fontSize: 36,
      lineHeight: 44,
      wordWrap: true,
      wordWrapWidth: 600,
      align: "center",
    }),
  });
  winsText.anchor.set(0.5, 0);
  uiLayer.addChild(winsText);

  let profile = PROFILE_LANDSCAPE;
  let designW = profile.W;
  let designH = profile.H;
  let WINS_BOX = { x: 0, y: 0, w: 600, h: 120 };
  let CELL = 100;
  let PADDING = 8;
  let reelsX = 0, reelsY = 0, totalW = 0, totalH = 0;
  let BTN_Y = 0;

  function applyLayout(vw, vh) {
    profile = pickProfile(vw, vh);
    designW = profile.W;
    designH = profile.H;

    const maxCellByWidth =
      (designW - 2 * profile.SIDE_MARGIN - profile.GAP * (REELS_COLS - 1)) / REELS_COLS;

    const heightBudget =
      designH
      - profile.TOP_MARGIN
      - profile.BOTTOM_MARGIN
      - profile.BTN_SIZE
      - profile.SPACE_BELOW_REELS
      - profile.SPACE_BELOW_BTN
      - profile.WINS_MIN_H;

    const maxCellByHeight =
      (heightBudget - profile.GAP * (REELS_ROWS - 1)) / REELS_ROWS;

    CELL = Math.floor(Math.max(0, Math.min(maxCellByWidth, maxCellByHeight)));
    PADDING = Math.round(CELL * profile.INNER_PADDING_FR);

    totalW = CELL * REELS_COLS + profile.GAP * (REELS_COLS - 1);
    totalH = CELL * REELS_ROWS + profile.GAP * (REELS_ROWS - 1);
    reelsX = Math.round((designW - totalW) / 2);
    reelsY = profile.TOP_MARGIN;

    BTN_Y = reelsY + totalH + profile.SPACE_BELOW_REELS;
    spinBtn.width = profile.BTN_SIZE;
    spinBtn.height = profile.BTN_SIZE;
    spinBtn.position.set(designW / 2, BTN_Y + profile.BTN_SIZE / 2);

    const winsW = Math.min(900, designW - 2 * profile.SIDE_MARGIN);
    const winsX = Math.round((designW - winsW) / 2);
    const winsY = BTN_Y + profile.BTN_SIZE + profile.SPACE_BELOW_BTN;
    const winsH = Math.max(profile.WINS_MIN_H, designH - profile.BOTTOM_MARGIN - winsY);
    WINS_BOX = { x: winsX, y: winsY, w: winsW, h: winsH };

    winsText.position.set(designW / 2, WINS_BOX.y);
    winsText.style.wordWrapWidth = WINS_BOX.w;

    reelsMask.clear().rect(reelsX, reelsY, totalW, totalH).fill(0xffffff);

    const target = Math.max(0, CELL - PADDING * 2);
    for (let r = 0; r < REELS_ROWS; r++) {
      for (let c = 0; c < REELS_COLS; c++) {
        const sp = spritesGrid[r][c];
        const cx = reelsX + c * (CELL + profile.GAP) + CELL / 2;
        const cy = reelsY + r * (CELL + profile.GAP) + CELL / 2;
        sp.position.set(cx, cy);
        sp.width = target;
        sp.height = target;
      }
    }
  }

  function fitWinsTextHeight() {
    winsText.scale.set(1);
    (app.ticker ?? PIXI.Ticker.shared).addOnce(() => {
      const h = winsText.height;
      if (h > WINS_BOX.h) winsText.scale.set(WINS_BOX.h / h);
    });
  }

  function gridFromPositions(positions) {
    const grid = Array.from({ length: REELS_ROWS }, () => Array(REELS_COLS).fill(""));
    for (let c = 0; c < REELS_COLS; c++) {
      const band = BANDS[c];
      const base = ((positions[c] % band.length) + band.length) % band.length;
      for (let r = 0; r < REELS_ROWS; r++) grid[r][c] = band[(base + r) % band.length];
    }
    return grid;
  }

  function evaluateWins(grid) {
    let total = 0;
    const lines = [];
    for (let i = 0; i < PAYLINES.length; i++) {
      const rows = PAYLINES[i];
      const firstSym = grid[rows[0]][0];
      let run = 1;
      for (let col = 1; col < REELS_COLS; col++) {
        if (grid[rows[col]][col] === firstSym) run++; else break;
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

  const valid = new Set(["hv1","hv2","hv3","hv4","lv1","lv2","lv3","lv4"]);
  function updateReelSprites(grid) {
    const target = Math.max(0, CELL - PADDING * 2);
    for (let r = 0; r < REELS_ROWS; r++) {
      for (let c = 0; c < REELS_COLS; c++) {
        const id = grid[r][c];
        const sp = spritesGrid[r][c];
        if (!valid.has(id)) { console.warn("Unknown symbol id:", id); continue; }
        sp.texture = textureFor(id);
        sp.width = target; sp.height = target;
      }
    }
  }

  function setWinningsText(positions, grid, result) {
    const lines = [
      `Positions: ${positions.join(", ")}`,
      "Screen:",
      ...grid.map((row) => "  " + row.join(" ")),
      `Total wins: ${result.total}`,
      ...result.lines,
    ];
    winsText.text = lines.join("\n");
    fitWinsTextHeight();
  }

  let positions = INITIAL_POSITIONS.slice();
  let rng = mulberry32(0xC0FFEE);
  const firstGrid = gridFromPositions(positions);
  updateReelSprites(firstGrid);
  setWinningsText(positions, firstGrid, evaluateWins(firstGrid));

  let spinning = false;
  spinBtn.on("pointerdown", () => {
    if (spinning) return;
    spinning = true;
    spinBtn.alpha = 0.85;

    positions = positions.map((_, c) => Math.floor(rng() * BANDS[c].length));
    const grid = gridFromPositions(positions);
    updateReelSprites(grid);
    setWinningsText(positions, grid, evaluateWins(grid));

    spinBtn.alpha = 1;
    spinning = false;
  });

  function resize() {
    const { width: vw, height: vh } = app.renderer.screen;
    applyLayout(vw, vh);
    const stageScale = Math.min(vw / designW, vh / designH);
    gameRoot.scale.set(stageScale);
    gameRoot.position.set(
      (vw - designW * stageScale) / 2,
      (vh - designH * stageScale) / 2
    );
    fitWinsTextHeight();
  }

  resize();
  window.addEventListener("resize", resize);

  function destroy() {
    window.removeEventListener("resize", resize);
    gameRoot.destroy({ children: true });
  }
  return { destroy };
}

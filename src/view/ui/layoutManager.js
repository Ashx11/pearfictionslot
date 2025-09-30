export function computeLayout(profile, cols, rows, designW, designH) {
  const maxCellByWidth = (designW - 2 * profile.SIDE_MARGIN - profile.GAP * (cols - 1)) / cols;

  const heightBudget =
    designH -
    profile.TOP_MARGIN -
    profile.BOTTOM_MARGIN -
    profile.BTN_SIZE -
    profile.SPACE_BELOW_REELS -
    profile.SPACE_BELOW_BTN -
    profile.WINS_MIN_H;

  const maxCellByHeight = (heightBudget - profile.GAP * (rows - 1)) / rows;

  const CELL = Math.floor(Math.max(0, Math.min(maxCellByWidth, maxCellByHeight)));
  const PADDING = Math.round(CELL * profile.INNER_PADDING_FR);

  const totalW = CELL * cols + profile.GAP * (cols - 1);
  const totalH = CELL * rows + profile.GAP * (rows - 1);

  const reelsX = Math.round((designW - totalW) / 2);
  const reelsY = profile.TOP_MARGIN;

  const BTN_Y = reelsY + totalH + profile.SPACE_BELOW_REELS;

  const winsW = Math.max(380, Math.min(560, Math.floor(designW * 0.55)));
  const winsX = Math.round((designW - winsW) / 2);
  const winsY = BTN_Y + profile.BTN_SIZE + profile.SPACE_BELOW_BTN;
  const winsH = Math.max(profile.WINS_MIN_H, Math.min(profile.WINS_MAX_H, 140));

  const rpPad = Math.max(12, Math.floor(CELL * 0.12)); // reels panel padding

  return {
    CELL,
    PADDING,
    reelsX,
    reelsY,
    totalW,
    totalH,
    BTN_Y,
    winsBox: { x: winsX, y: winsY, w: winsW, h: winsH },
    panelPad: rpPad,
  };
}

export function applyLayoutToSprites(spritesGrid, layout, gap) {
  const rows = spritesGrid.length;
  const cols = spritesGrid[0]?.length ?? 0;
  const { CELL, PADDING, reelsX, reelsY } = layout;
  const target = Math.max(0, CELL - PADDING * 2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sp = spritesGrid[r][c];
      const cx = reelsX + c * (CELL + gap) + CELL / 2;
      const cy = reelsY + r * (CELL + gap) + CELL / 2;
      sp.position.set(cx, cy);
      sp.width = target;
      sp.height = target;
    }
  }
}

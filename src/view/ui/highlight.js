import * as PIXI from 'pixi.js';

export function drawWinningOutlines(
  layer,
  cells,
  { color, cellSize, gap, reelsX, reelsY, radius },
) {
  layer.clear();
  if (!cells.length) return;
  const stroke = { color, width: 4 };
  for (const { r, c } of cells) {
    const x = reelsX + c * (cellSize + gap);
    const y = reelsY + r * (cellSize + gap);
    layer.roundRect(x, y, cellSize, cellSize, radius).stroke(stroke);
  }
  layer.alpha = 0.9;
}

export function makeHighlighter(app, spritesGrid, highlightLayer) {
  let last = [];
  let flashTicker = null;

  function clear() {
    if (flashTicker) {
      (app.ticker ?? PIXI.Ticker.shared).remove(flashTicker);
      flashTicker = null;
    }
    for (const sp of last) {
      sp.tint = 0xffffff;
      sp.scale.set(sp._baseScale ?? 1);
    }
    last.length = 0;
    highlightLayer.clear();
  }

  function flash(cells, { pulseColor, cellSize, gap, reelsX, reelsY }) {
    clear();
    if (!cells.length) return;

    for (const { r, c } of cells) {
      const sp = spritesGrid[r][c];
      if (!sp) continue;
      sp._baseScale = sp._baseScale || sp.scale.x || 1;
      last.push(sp);
    }

    const radius = Math.max(10, Math.floor(cellSize * 0.1));
    drawWinningOutlines(highlightLayer, cells, {
      color: pulseColor,
      cellSize,
      gap,
      reelsX,
      reelsY,
      radius,
    });

    const start = performance.now();
    const DURATION = 800;

    flashTicker = () => {
      const t = performance.now() - start;
      const phase = Math.sin((t / 120) * Math.PI);
      for (const sp of last) {
        sp.tint = phase > 0 ? pulseColor : 0xffffff;
        const s = sp._baseScale;
        sp.scale.set(s * (1 + 0.03 * phase));
      }
      highlightLayer.alpha = 0.6 + 0.3 * Math.max(0, phase);
      if (t >= DURATION) clear();
    };
    (app.ticker ?? PIXI.Ticker.shared).add(flashTicker);
  }

  return { flash, clear };
}

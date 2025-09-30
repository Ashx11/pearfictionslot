import * as PIXI from 'pixi.js';

const COLS = 5,
  ROWS = 3;
const GAP = 12;

export async function loadAssetsAndShowLoader(app) {
  const layer = new PIXI.Container();
  app.stage.addChild(layer);

  const bg = new PIXI.Graphics();
  layer.addChild(bg);

  // Percentage text (spec requirement)
  const pct = new PIXI.Text({
    text: 'Loading 0%',
    style: { fill: 0xffffff, fontSize: 40, fontWeight: '600', align: 'center' },
  });
  pct.anchor.set(0.5);
  layer.addChild(pct);

  // Skeleton placeholders + progress bar
  const skeleton = new PIXI.Container();
  layer.addChild(skeleton);

  let barBgRef = null;
  let barFillRef = null;

  function layout(vw, vh) {
    // Fullscreen background
    bg.clear().rect(0, 0, vw, vh).fill(0x0e0f13);

    // Text near top-center
    const textTop = Math.max(40, vh * 0.16);
    pct.position.set(vw / 2, textTop);

    // Grid sizing
    const sidePad = Math.max(24, vw * 0.06);
    const topPad = Math.max(16, vh * 0.08);
    const bottomReserve = 120;

    const availW = vw - sidePad * 2;
    const availH = vh - textTop - topPad - bottomReserve;

    const cellW = (availW - GAP * (COLS - 1)) / COLS;
    const cellH = (availH - GAP * (ROWS - 1)) / ROWS;
    const cell = Math.floor(Math.max(32, Math.min(cellW, cellH)));

    const gridW = COLS * cell + GAP * (COLS - 1);
    const gridH = ROWS * cell + GAP * (ROWS - 1);

    const gx = Math.floor((vw - gridW) / 2);
    const gy = Math.floor(textTop + topPad + (availH - gridH) / 2);

    skeleton.removeChildren();

    // 5×3 rounded rect placeholders
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const card = new PIXI.Graphics()
          .roundRect(0, 0, cell, cell, Math.min(18, cell * 0.2))
          .fill(0x1a2232);
        card.alpha = 0.6;
        card.position.set(gx + c * (cell + GAP), gy + r * (cell + GAP));
        skeleton.addChild(card);
      }
    }

    // Progress bar
    const barW = Math.min(gridW, Math.max(240, vw * 0.5));
    const barH = 12;
    const barX = Math.floor((vw - barW) / 2);
    const barY = Math.floor(gy + gridH + 36);

    barBgRef = new PIXI.Graphics().roundRect(0, 0, barW, barH, 6).fill(0x111623);
    barBgRef.position.set(barX, barY);
    barBgRef.label = 'barBg';
    skeleton.addChild(barBgRef);

    barFillRef = new PIXI.Graphics().roundRect(0, 0, 1, barH, 6).fill(0x5e74ff);
    barFillRef.position.set(barX, barY);
    barFillRef.label = 'barFill';
    skeleton.addChild(barFillRef);
  }

  const relayout = () => layout(app.renderer.width, app.renderer.height);
  relayout();
  const onResize = () => relayout();
  window.addEventListener('resize', onResize);

  const pulseTicker = () => {
    const t = performance.now() / 700;
    const alpha = 0.45 + Math.abs(Math.sin(t)) * 0.25;
    for (const child of skeleton.children) {
      if (child.label === 'barFill' || child.label === 'barBg') continue;
      if (child instanceof PIXI.Graphics) child.alpha = alpha;
    }
  };
  app.ticker.add(pulseTicker);

  const ASSET_MAP = {
    hv1: 'assets/hv1_symbol.png',
    hv2: 'assets/hv2_symbol.png',
    hv3: 'assets/hv3_symbol.png',
    hv4: 'assets/hv4_symbol.png',
    lv1: 'assets/lv1_symbol.png',
    lv2: 'assets/lv2_symbol.png',
    lv3: 'assets/lv3_symbol.png',
    lv4: 'assets/lv4_symbol.png',
    spin: 'assets/spin_button.png',
  };
  PIXI.Assets.addBundle('game', ASSET_MAP);

  // Progress callback updates % text and progress bar width
  const onProgress = (p) => {
    const percent = Math.round(p * 100);
    pct.text = `Loading ${percent}%`;

    if (barFillRef && barBgRef) {
      const totalW = barBgRef.width;
      const w = Math.max(1, Math.floor((percent / 100) * totalW));
      barFillRef.clear().roundRect(0, 0, w, barBgRef.height, 6).fill(0x5e74ff);
    }
  };

  try {
    await PIXI.Assets.loadBundle('game', onProgress);
  } catch (err) {
    console.error('Asset load failed:', err);
    pct.text = 'Loading error – check console';
  }

  // Cleanup loader layer & listeners
  app.ticker.remove(pulseTicker);
  window.removeEventListener('resize', onResize);
  app.stage.removeChild(layer);
  layer.destroy({ children: true });
}

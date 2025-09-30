import * as PIXI from 'pixi.js';

export function createBackground(stage) {
  const bg = new PIXI.Graphics();
  stage.addChildAt(bg, 0);
  return bg;
}

export function createRoot(stage) {
  const gameRoot = new PIXI.Container();
  stage.addChild(gameRoot);
  return gameRoot;
}

export function createReelsPanel(parent) {
  const reelsPanel = new PIXI.Graphics();
  parent.addChild(reelsPanel);
  return reelsPanel;
}

export function createLayers(parent) {
  const reelsLayer = new PIXI.Container();
  const uiLayer = new PIXI.Container();
  parent.addChild(reelsLayer, uiLayer);

  const highlightLayer = new PIXI.Graphics();
  parent.addChild(highlightLayer);

  const paylinesLayer = new PIXI.Graphics();
  parent.addChild(paylinesLayer);

  const reelsMask = new PIXI.Graphics();
  reelsLayer.mask = reelsMask;
  parent.addChild(reelsMask);

  return { reelsLayer, uiLayer, highlightLayer, paylinesLayer, reelsMask };
}

export function drawBackground(bg, vw, vh) {
  bg.clear().rect(0, 0, vw, vh).fill(0xf2f4f8);
}

export function drawReelsPanel(g, x, y, w, h, r = 18) {
  g.clear()
    .roundRect(x, y, w, h, r)
    .fill(0x000000, 0.04)
    .roundRect(x, y, w, h, r)
    .fill(0xffffff, 0.9)
    .stroke({ color: 0xd8e0ea, width: 2 });
}

export function drawReelsMask(mask, x, y, w, h) {
  mask.clear().rect(x, y, w, h).fill(0xffffff);
}

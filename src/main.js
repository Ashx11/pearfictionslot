import * as PIXI from 'pixi.js';
import { loadAssetsAndShowLoader } from './view/loaderScene.js';
import { createGameScene } from './view/gameScene.js';

async function boot() {
  const app = new PIXI.Application();
  await app.init({
    background: '#f1f3f6ff',
    antialias: true,
    autoDensity: true,
    resolution: Math.ceil(window.devicePixelRatio || 1),
    resizeTo: window,
  });
  document.getElementById('app').appendChild(app.canvas);

  await loadAssetsAndShowLoader(app);
  createGameScene(app);
}
boot();

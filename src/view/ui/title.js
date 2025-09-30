import * as PIXI from 'pixi.js';

export function createTitle(uiLayer, text = 'Pearfiction Slot Machine') {
  const title = new PIXI.Text({
    text,
    style: new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: '800',
      fill: 0x111827,
      letterSpacing: 0.5,
      align: 'center',
      dropShadow: true,
      dropShadowDistance: 2,
      dropShadowAlpha: 0.15,
    }),
  });
  title.anchor.set(0.5, 0);
  uiLayer.addChild(title);
  return title;
}

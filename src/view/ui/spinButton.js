import * as PIXI from 'pixi.js';

export function createSpinButton(uiLayer, textureFor, size, centerX, y, onClick) {
  const btn = new PIXI.Container();
  btn.eventMode = 'static';
  btn.cursor = 'pointer';
  btn.alpha = 1;
  btn.position.set(centerX, y + size / 2);

  const icon = new PIXI.Sprite(textureFor('spin'));
  icon.anchor.set(0.5);
  btn.addChild(icon);

  const getBase = () => Math.max(icon.texture?.width || 1, icon.texture?.height || 1);

  const applySize = (px) => {
    const base = getBase();
    icon.scale.set(px / base);
    btn.hitArea = new PIXI.Circle(0, 0, px / 2);
  };

  if (!icon.texture.valid) {
    icon.texture.once('update', () => applySize(size));
  }
  applySize(size);

  btn.on('pointerdown', () => onClick && onClick());
  btn.on('pointerover', () => {
    btn.alpha = 0.92;
  });
  btn.on('pointerout', () => {
    btn.alpha = 1;
  });
  btn.on('pointerup', () => {
    btn.alpha = 1;
  });
  btn.on('pointerupoutside', () => {
    btn.alpha = 1;
  });

  btn.setSize = (px) => applySize(px);

  uiLayer.addChild(btn);
  return btn;
}

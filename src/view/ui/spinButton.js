import * as PIXI from 'pixi.js';

export function createSpinButton(uiLayer, textureFor, size, centerX, y, onClick) {
  const spinBtn = new PIXI.Sprite(textureFor('spin'));
  spinBtn.anchor.set(0.5);
  spinBtn.eventMode = 'static';
  spinBtn.cursor = 'pointer';
  spinBtn.width = size;
  spinBtn.height = size;
  spinBtn.position.set(centerX, y + size / 2);
  uiLayer.addChild(spinBtn);

  // micro interaction
  const bump = (factor) => {
    const s = spinBtn.scale.x || 1;
    spinBtn.scale.set(s * factor);
    return () => spinBtn.scale.set(s);
  };

  spinBtn.on('pointerdown', () => {
    const reset = bump(1.05);
    setTimeout(reset, 100);
    onClick?.();
  });
  spinBtn.on('pointerover', () => bump(1.03));
  spinBtn.on('pointerout', () => {
    const s = spinBtn.scale.x || 1;
    spinBtn.scale.set(s / 1.03);
  });

  return spinBtn;
}

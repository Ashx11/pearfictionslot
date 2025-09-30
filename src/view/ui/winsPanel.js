import * as PIXI from 'pixi.js';

export function createWinsPanel(uiLayer) {
  const winsPanel = new PIXI.Graphics();
  uiLayer.addChild(winsPanel);

  const winsText = new PIXI.Text({
    text: '',
    style: new PIXI.TextStyle({
      fill: 0x1a1a1a,
      fontFamily: 'Arial',
      fontWeight: '700',
      fontSize: 30,
      lineHeight: 38,
      letterSpacing: 0.4,
      wordWrap: true,
      wordWrapWidth: 560,
      align: 'center',
    }),
  });
  winsText.anchor.set(0.5, 0);
  uiLayer.addChild(winsText);

  let box = { x: 0, y: 0, w: 560, h: 140 };

  function setBox(newBox) {
    box = { ...newBox };
    winsText.position.set(box.x + box.w / 2, box.y + 10);
    winsText.style.wordWrapWidth = Math.max(100, box.w - 24);
  }

  function drawPanel(color, alpha) {
    winsPanel.clear().roundRect(box.x, box.y, box.w, box.h, 14).fill(color, alpha);
  }

  function setText(text) {
    winsText.text = text;
  }

  function fitHeight(app) {
    winsText.scale.set(1);
    (app.ticker ?? PIXI.Ticker.shared).addOnce(() => {
      const h = winsText.height;
      if (h > box.h - 16) winsText.scale.set((box.h - 16) / h);
    });
  }

  return {
    winsPanel,
    winsText,
    setBox,
    drawPanel,
    setText,
    fitHeight,
    get box() {
      return box;
    },
  };
}

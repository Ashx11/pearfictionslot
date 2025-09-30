import * as PIXI from "pixi.js";

export function createTitle(uiLayer, text = "Pearfiction Slot Machine") {
  const title = new PIXI.Text({
    text,
    style: new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,          // will be overridden by layoutTitle()
      fontWeight: "800",
      fill: 0x111827,
      letterSpacing: 0.5,
      align: "center",
      dropShadow: true,
      dropShadowDistance: 2,
      dropShadowAlpha: 0.15,
    }),
  });
  title.anchor.set(0.5, 0);
  uiLayer.addChild(title);
  return title;
}

export function layoutTitle(title, designW, profile, offsetY = -14) {
  const k = (profile.W > profile.H) ? 0.026 : 0.023;
  const size = Math.round(Math.max(16, Math.min(32, designW * k)));
  title.style.fontSize = size;
  const y = Math.max(6, profile.TOP_MARGIN - size - 6 + offsetY);
  title.position.set(designW / 2, y);
}



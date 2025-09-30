import * as PIXI from "pixi.js";

export async function loadAssetsAndShowLoader(app) {
  const loaderLayer = new PIXI.Container();
  app.stage.addChild(loaderLayer);

  const pct = new PIXI.Text({
    text: "Loading 0%",
    style: { fill: 0xffffff, fontSize: 40, fontWeight: "600", align: "center" },
  });
  pct.anchor.set(0.5);
  loaderLayer.addChild(pct);

  const center = () => pct.position.set(app.renderer.width / 2, app.renderer.height / 2);
  center();
  app.ticker.add(center);
  
  const ASSET_MAP = {
    hv1: "assets/hv1_symbol.png",
    hv2: "assets/hv2_symbol.png",
    hv3: "assets/hv3_symbol.png",
    hv4: "assets/hv4_symbol.png",
    lv1: "assets/lv1_symbol.png",
    lv2: "assets/lv2_symbol.png",
    lv3: "assets/lv3_symbol.png",
    lv4: "assets/lv4_symbol.png",
    spin: "assets/spin_button.png",
  };

  PIXI.Assets.addBundle("game", ASSET_MAP);

  try {
    await PIXI.Assets.loadBundle("game", (progress) => {
      pct.text = `Loading ${Math.round(progress * 100)}%`;
    });
  } catch (err) {
    console.error("Asset load failed:", err);
    pct.text = "Loading error – check console";
  }

  app.ticker.remove(center);
  app.stage.removeChild(loaderLayer);
  loaderLayer.destroy({ children: true });
}

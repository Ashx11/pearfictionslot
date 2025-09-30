import * as PIXI from 'pixi.js';

export function createReelsGrid(parent, rows, cols, anchor = 0.5) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      const sp = new PIXI.Sprite();
      sp.anchor.set(anchor);
      parent.addChild(sp);
      return sp;
    }),
  );
}

export function updateReelsGrid(spritesGrid, grid, targetSize, getTexture) {
  const rows = spritesGrid.length;
  const cols = spritesGrid[0]?.length ?? 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = grid[r][c];
      const sp = spritesGrid[r][c];
      const tex = getTexture(id);
      if (tex) sp.texture = tex;
      sp.width = targetSize;
      sp.height = targetSize;
    }
  }
}

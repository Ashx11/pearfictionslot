export function redrawPaylineOverlay(
  g,
  winningLines,
  { cellSize, gap, reelsX, reelsY, color = 0x16a34a, alpha = 0.35 },
) {
  g.clear();
  if (!winningLines || winningLines.length === 0) return;

  const stroke = { color, width: 5, alpha };
  const dotR = Math.max(3, Math.floor(cellSize * 0.05));

  for (const w of winningLines) {
    for (let i = 0; i < w.cells.length - 1; i++) {
      const c1 = w.cells[i],
        c2 = w.cells[i + 1];
      const x1 = reelsX + c1.c * (cellSize + gap) + cellSize / 2;
      const y1 = reelsY + c1.r * (cellSize + gap) + cellSize / 2;
      const x2 = reelsX + c2.c * (cellSize + gap) + cellSize / 2;
      const y2 = reelsY + c2.r * (cellSize + gap) + cellSize / 2;
      g.moveTo(x1, y1).lineTo(x2, y2).stroke(stroke);
    }
    const first = w.cells[0];
    const last = w.cells[w.cells.length - 1];
    const fx = reelsX + first.c * (cellSize + gap) + cellSize / 2;
    const fy = reelsY + first.r * (cellSize + gap) + cellSize / 2;
    const lx = reelsX + last.c * (cellSize + gap) + cellSize / 2;
    const ly = reelsY + last.r * (cellSize + gap) + cellSize / 2;
    g.circle(fx, fy, dotR).fill(color, alpha);
    g.circle(lx, ly, dotR).fill(color, alpha);
  }
}

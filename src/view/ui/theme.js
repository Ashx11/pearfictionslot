// Win color (for outlines/lines) still based on total payout
export function winTheme(total) {
  if (total <= 0)
    return { outline: 0x000000, pulse: 0x000000, panel: 0x000000, panelA: 0.0, line: 0x000000 };
  if (total >= 20)
    return { outline: 0xf5c542, pulse: 0xf5c542, panel: 0xf5c542, panelA: 0.16, line: 0xe2b339 }; // jackpot gold
  if (total >= 10)
    return { outline: 0x38bdf8, pulse: 0x38bdf8, panel: 0x38bdf8, panelA: 0.14, line: 0x22a7e6 }; // medium win cyan
  return { outline: 0x22c55e, pulse: 0x22c55e, panel: 0x22c55e, panelA: 0.12, line: 0x16a34a }; // win green
}

// New: background panel color by UI state (pre/post spin)
export function panelThemeForState(state) {
  switch (state) {
    case 'ready': // pale yellow
      return { panel: 0xfef3c7, panelA: 0.95 };
    case 'loss': // soft red
      return { panel: 0xfee2e2, panelA: 0.95 };
    case 'win': // soft green
      return { panel: 0xdcfce7, panelA: 0.95 };
    case 'jackpot': // soft gold
      return { panel: 0xfaf3d7, panelA: 0.95 };
    default: // neutral transparent
      return { panel: 0x000000, panelA: 0.0 };
  }
}

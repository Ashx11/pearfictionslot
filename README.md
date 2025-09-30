# PearFiction Slot Machine (PixiJS + Vite)

**Live demo:** https://ashx11.github.io/pearfictionslot/

A small, production-style implementation of the take-home assignment using ES2015 JavaScript, PixiJS for rendering, Vite for dev/build, and Vitest for unit tests.

It loads assets with a preloader, shows a 5×3 reel grid, a spin button, and a wins text area. The layout resizes responsively and remains centered.

---

## ✨ Quick start

```sh
# 1) Install dependencies
npm i

# 2) Start the dev server
npm run dev
# open the printed local URL

# 3) Run unit tests
npm run test

# or watch for changes:
npm run test:watch

# 4) Build & preview for production
npm run build
npm run preview
```

---

## 📦 Tech stack

- **PixiJS 8** – Rendering & scenes
- **Vite 5** – Dev server & bundling
- **Vitest** – Unit tests (pure logic)
- **ESLint (flat config) + Prettier** – Code consistency & formatting

---

## 🗂 Project structure

```
public/
  assets/                 # provided images (symbols & spin button)
src/
  constants/
    bands.js             # reelset bands
    paylines.js          # 7 paylines (row indices per column)
    paytable.js          # payout matrix (3/4/5 of a kind)
  lib/
    grid.js
    logic.js             # PURE FUNCTIONS: gridFromPositions, evaluateWins
  view/
    ui                   # UI components
    loaderScene.js       # preloader (percentage + skeleton placeholders)
    gameScene.js         # main gameplay scene & responsive layout
  main.js                # PixiJS App boot → loader → game scene
tests/
  grid.test.js           # initial screen validation & helpers
  pay.test.js            # winnings cases from the spec
index.html
```

---

## ✅ Assignment mapping

- **5×3 reels + spin button + wins text**: Implemented in `src/view/gameScene.js`.
- **Centered layout & resizes**: The game area auto-scales to the viewport; elements maintain their spacing and hierarchy in both landscape and portrait orientations.
- **Preloader with percentage**: `loaderScene.js` shows “Loading XX%” using `PIXI.Text` while loading all images before the game starts.
- **Sprites for symbols & button**: Every visible symbol is a `PIXI.Sprite`; the spin button uses the provided circular image.
- **Random positions on spin (no animation required)**: On click (or `Space`/`Enter`), each reel picks a random band index, and the screen updates instantly.
- **Winnings calculation**: Pure logic is handled in `src/lib/logic.js`:
  - `gridFromPositions(positions)` builds the 3×5 symbol matrix from the reel bands.
  - `evaluateWins(grid)` checks 7 left-to-right paylines and returns `{ total, lines }`.
- **Wins text formatting & scaling**: The text first prints the total win, followed by a list of winning lines, for example:
  ```
  - payline 2, hv2 x3, 5
  - payline 5, lv3 x3, 1
  ```
  The text container automatically scales to fit the available area below the spin button.

---

## 🧮 Winnings model (paytable)

| Symbol | 3 in a row | 4 in a row | 5 in a row |
| :----- | :--------: | :--------: | :--------: |
| `hv1`  |     10     |     20     |     50     |
| `hv2`  |     5      |     10     |     20     |
| `hv3`  |     5      |     10     |     15     |
| `hv4`  |     5      |     10     |     15     |
| `lv1`  |     2      |     5      |     10     |
| `lv2`  |     1      |     2      |     5      |
| `lv3`  |     1      |     2      |     3      |
| `lv4`  |     1      |     2      |     3      |

### Paylines

_(Rows are 0=top, 1=middle, 2=bottom)_

- `[1,1,1,1,1]` (middle)
- `[0,0,0,0,0]` (top)
- `[2,2,2,2,2]` (bottom)
- `[0,0,1,2,2]`
- `[2,2,1,0,0]`
- `[0,1,2,1,0]`
- `[2,1,0,1,2]`

---

## 🧪 Testing

The game's mathematical logic and reel projection functions are kept pure and are fully unit-tested:

- `gridFromPositions` is tested to ensure it reproduces the exact matrices from the spec (for both the initial screen and provided examples).
- `evaluateWins` is validated to match the spec’s total wins and payline details for all given scenarios.

Run tests with `npm run test` (or `npm run test:watch` while developing).

---

## 🖥 UI & UX notes

- **Responsive layout**: Two primary profiles (landscape/portrait) compute cell sizes, spacing, and reserve space for the UI panel (button and wins).
- **Centered design**: The main grid panel is centered with soft edges, and the entire scene scales to fit the viewport.
- **Keyboard support**: `Space` or `Enter` keys can be used to trigger a spin, mirroring the button's click behavior.
- **Wins feedback (polish)**:
  - When a line wins, its path is drawn as a subtle overlay on the reels.
  - Winning symbols briefly pulse and are tinted (green for small wins, gold for big wins).
  - The wins panel is highlighted when `total > 0`, with a stronger effect for large totals.
- **No currency**: No actual money or credits are tracked. The “Total wins” display demonstrates the calculation and presentation based on the paytable.

---

## 🧹 Linting & formatting

```sh
# Format code with Prettier
npm run format

# Check formatting without changing files
npm run format:check

# Run ESLint to find issues
npm run lint

# Automatically fix ESLint issues
npm run lint:fix
```

**Configuration files:**

- `eslint.config.js` (flat config for ESLint 9)
- `.prettierrc` & `.prettierignore`

---

## 🔧 Implementation details

- **Reel projection**: For each column, a random band index (`position`) is chosen. This index selects the symbol for the top row, and the next two items in the band (with wrap-around logic) fill the middle and bottom cells.
- **No spinning animation**: As per the assignment, symbols update instantly after new reel positions are chosen.
- **Scene separation**:
  - `loaderScene` mounts, loads the asset bundle, and unmounts cleanly.
  - `gameScene` mounts only after all textures have been cached by `PIXI.Assets`.

---

## 🔍 Assumptions

- Only exact symbol matches from the first column to the right count (no wilds or scatters).
- A payline pays for the longest left-aligned sequence of identical symbols (minimum of 3).
- Multiple paylines can award wins simultaneously; their payouts are summed for the total win.

---

## 🚀 What to try (manual QA)

- Verify the initial screen matches the spec for positions `[0,0,0,0,0]`.
- Click **Spin** repeatedly and confirm:
  - Symbols change according to the defined reel bands.
  - The payline text correctly matches the visible winning lines.
- Check that the wins panel always fits its designated area and remains readable on resize.
- Resize the browser window (to both narrow mobile widths and tall desktop heights) to test the responsive layout rules.

---

## 🗺 Future improvements

While out of scope for this assignment, the project can be easily extended with:

- Reel spin animations and easing effects.
- Line-by-line win reveals, sequencing, and sound effects (SFX).
- Configuration-driven skins, themes, and paytable adjustments.
- A minimal credits/bet overlay to display a running balance (non-monetary).

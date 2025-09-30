// Rows: 0=top, 1=middle, 2=bottom
export const PAYLINES = [
  [1, 1, 1, 1, 1], // 1 middle straight
  [0, 0, 0, 0, 0], // 2 top straight
  [2, 2, 2, 2, 2], // 3 bottom straight
  [0, 0, 1, 2, 2], // 4 diagonal down-right
  [2, 2, 1, 0, 0], // 5 diagonal up-right
  [0, 1, 2, 1, 0], // 6 V shape
  [2, 1, 0, 1, 2], // 7 inverted V
];

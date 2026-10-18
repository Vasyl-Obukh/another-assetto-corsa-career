/**
 * How far a screen designed for one size is scaled for a window: its shorter
 * side over the side it was designed at, held within bounds.
 * @param side The window's shorter side, in CSS pixels
 * @param design The shorter side the screen was designed at
 * @param min The least it is scaled by
 * @param max The most it is scaled by
 * @returns The scale, one at the design size
 */
export const viewportScale = (side: number, design: number, min: number, max: number): number => (
  Math.min(max, Math.max(min, side / design))
);

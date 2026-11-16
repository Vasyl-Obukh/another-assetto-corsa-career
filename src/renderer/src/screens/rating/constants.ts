/**
 * The rating chart's measurements, in pixels: its height, the room kept for
 * the floors' figures on the left and the lines' names on the right, the gaps
 * above and below, how far past the ratings the drawing reaches either way, in
 * rating points, and how far apart two lines' end labels are kept.
 */
export const CHART = {
  height: 220,
  left: 52,
  right: 132,
  top: 8,
  bottom: 22,
  pad: 300,
  labelGap: 13,
} as const;

/**
 * The colour each rung's band is drawn in behind the chart's lines, the top
 * rung first - its metal, as its chip wears it.
 */
export const TIER_BAND: readonly string[] = [
  'var(--tier-platinum)',
  'var(--tier-gold)',
  'var(--tier-silver)',
  'var(--tier-bronze)',
  'var(--tier-rookie)',
];


/**
 * Where the rating log keeps its filter. The season is not kept: it opens on
 * the one under way, which moves on.
 */
export const RATING_FILTER_MEMORY = 'rating.filter';

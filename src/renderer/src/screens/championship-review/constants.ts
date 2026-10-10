/**
 * The position chart's drawing box and the margins its labels sit in, in the
 * SVG's own units - it stretches to its card's width.
 */
export const CHART = {
  width: 640,
  height: 176,
  left: 34,
  right: 14,
  top: 12,
  bottom: 24,
} as const;

/**
 * The positions the chart rules a line at, besides the bottom of the field: the
 * podium's edge, the top six and the points places of most tables.
 */
export const CHART_TICKS = [1, 3, 6, 10, 15, 20] as const;

/**
 * How many rows the final table's skeleton holds, and how many rounds the
 * skeleton's round tiles stand for - a short season, the common case.
 */
export const REVIEW_SKELETON = {
  rows: 8,
  rounds: 5,
} as const;

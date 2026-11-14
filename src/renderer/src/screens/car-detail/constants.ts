// Measurements for the car page's livery carousel and its curves chart, and the
// labels its skeleton draws.

import type { ParseKeys } from 'i18next';

/**
 * How many gridlines divide each axis of the curves chart.
 */
export const CHART_DIVISIONS = 4;

/**
 * The steps an axis is rounded up to, within each power of ten - so a peak of
 * 511 bhp tops out at 600 rather than at an unlabelled 511.
 */
export const NICE_STEPS: readonly number[] = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/**
 * Engine speed between two rev labels on the chart.
 */
export const RPM_LABEL_STEP = 1000;

/**
 * Revs in a thousand, for labelling the rev axis in k.
 */
export const RPM_PER_K = 1000;

/**
 * The chart's drawing box, in SVG units: it scales to the panel's width.
 */
export const CHART_BOX = {
  width: 560,
  height: 200,
  left: 40,
  right: 40,
  top: 10,
  bottom: 24,
} as const;

/**
 * Tenths, for rounding a nought-to-hundred time to one decimal place.
 */
export const TENTHS = 10;

/**
 * The label of each of a car's figures but the last, in the order the strip
 * shows them - what the page's skeleton draws before the car arrives. The last,
 * the standing start, is named in the units the player reads.
 */
export const FIGURE_LABELS: readonly ParseKeys[] = [
  'cars.detail.power',
  'cars.detail.torque',
  'cars.detail.weight',
  'cars.detail.powerToWeight',
  'cars.detail.topSpeed',
];

/**
 * How many livery thumbnails the stage's skeleton holds under the picture.
 */
export const LIVERY_SKELETON = 2;

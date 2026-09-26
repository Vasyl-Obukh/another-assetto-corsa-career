// How much the track page shows before folding, and the counts its skeleton
// draws.

import type { ParseKeys } from 'i18next';

/**
 * How many championships each discipline lists before folding the rest, so a
 * circuit with twenty Formula One seasons still shows its other disciplines.
 */
export const CHAMPIONSHIPS_PER_DISCIPLINE = 4;

/**
 * The label of each of a circuit's figures, in the order the band shows them -
 * what the page's skeleton draws before the circuit arrives.
 */
export const FIGURE_LABELS: readonly ParseKeys[] = [
  'tracks.detail.length',
  'tracks.detail.width',
  'tracks.detail.pitboxes',
  'tracks.detail.direction',
  'tracks.detail.layouts',
];

/**
 * How many layout cards the skeleton holds.
 */
export const LAYOUT_SKELETON = 4;

/**
 * How many photograph thumbnails the stage's skeleton holds.
 */
export const PHOTO_SKELETON = 3;

/**
 * How many championship rows the skeleton holds.
 */
export const CHAMPIONSHIP_SKELETON = 6;

/**
 * Characters that separate a circuit's name from a layout's in the names
 * authors write - "Brands Hatch - GP", "Spa: Endurance".
 */
export const NAME_SEPARATORS = /^[\s\-\u2013\u2014\u00b7:,/]+/;

/**
 * Coordinates are written to three decimal places - about a hundred metres,
 * which places a circuit as well as anyone needs, and is as many as the
 * number formatter writes.
 */
export const COORDINATE_PRECISION = 1e3;

/**
 * The fewest characters a description needs, once the circuit's own name is
 * taken out, to be shown at all.
 */
export const MIN_DESCRIPTION = 60;

/**
 * The longest description shown whole without a Read more.
 */
export const CLAMPED_DESCRIPTION = 360;

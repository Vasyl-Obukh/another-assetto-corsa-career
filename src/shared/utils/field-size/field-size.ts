// How big a championship's field is, and whether a track's pit boxes hold it.
// Shared because main refuses a round the field outgrows and the renderer warns
// of it before then, and the two must agree on which.

import type { Championship } from '../../types/index.ts';

/**
 * How many cars a championship or a historic event puts on the grid, every
 * class together.
 * @param series The championship
 * @returns The seats, the player's included
 */
export const fieldSize = (series: Pick<Championship, 'entries'>): number => (
  series.entries.reduce((sum, entry) => sum + entry.seats.length, 0)
);

/**
 * Whether a field is too big for a track's pit boxes. A track that does not say
 * how many it has, or says none, is taken to hold any field.
 * @param field Cars on the grid, every class together
 * @param pitboxes The track's pit boxes, as its ui_track.json gives them
 * @returns True when some car would have no box
 */
export const tooFewPitboxes = (field: number, pitboxes: number | null | undefined): boolean => (
  !!pitboxes && field > pitboxes
);

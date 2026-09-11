import type { SeriesOrigin } from '../../../../shared/types';

/**
 * The colour each origin's badge takes.
 *
 * A hue of its own per origin, so "you changed the app's own" and "this was
 * never ours" are told apart in a list where both appear. Shipped wears no
 * badge at all, so it carries none.
 *
 * Keyed on the origin the library computes rather than on the word shown:
 * `adjusted` reads as "Modified" and `user` as "Custom", which are
 * translations rather than renames.
 */
export const ORIGIN_TAG_CLASS = {
  adjusted: 'border-transparent bg-origin-modified text-origin-modified-foreground',
  user: 'border-transparent bg-origin-custom text-origin-custom-foreground',
  shipped: '',
} as const satisfies Record<SeriesOrigin, string>;

/**
 * The entry list laid out as columns read downwards.
 *
 * CSS multi-column rather than a grid, which is the whole point: a grid flows
 * left to right, so a twenty-car field would read 1, 2 across the first row.
 * Columns flow down then across, so the left column is the front half of the
 * field and the right is the back, which is how an entry list is printed.
 *
 * The cap and the wide gutter are FIELD_GRID's, and for its reason: a seat puts
 * the driver at one end of its row and the team at the other, so given the
 * whole card they drift too far apart to read across. Same arithmetic too -
 * 56rem less the 8rem gutter leaves each column 24rem.
 */
export const SEAT_COLUMNS = 'columns-1 max-w-4xl gap-x-32 sm:columns-2';

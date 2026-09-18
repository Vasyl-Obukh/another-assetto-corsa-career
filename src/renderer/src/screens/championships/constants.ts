import type { VariantProps } from 'class-variance-authority';

import type { AvailabilityState } from './utils.ts';
import type { badgeVariants } from '@/components/ui/badge.tsx';

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

/**
 * The badge each availability state wears.
 *
 * A traffic light rather than a pair: "Misconfigured" is neither a library
 * problem nor nothing wrong, and amber is what says so without a sentence.
 * Checked against the badge's own variants, so a colour that is not offered
 * fails here rather than silently rendering as the default one.
 */
export const AVAILABILITY_VARIANT = {
  available: 'success',
  misconfigured: 'warning',
  unavailable: 'destructive',
} as const satisfies Record<
AvailabilityState,
NonNullable<VariantProps<typeof badgeVariants>['variant']>
>;

/**
 * A championship card's title, stretched over the whole card.
 *
 * Stretched rather than wrapping the card, so the card reads as one link or
 * button without nesting its own controls inside it - which is why those
 * controls each lift themselves to `z-10`.
 */
export const CARD_TITLE = 'min-w-0 flex-1 truncate text-left font-medium after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none';

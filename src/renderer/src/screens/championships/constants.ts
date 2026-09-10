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

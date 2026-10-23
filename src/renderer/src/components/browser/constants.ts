import type { ProvenancePicks } from './types.ts';
import { ContentSource } from '../../../../shared/types';

/**
 * How many skeleton cards stand in for the first page while it loads.
 */
export const SKELETON_COUNT = 8;

/**
 * The track every switch in the app wears: green when on, a darker grey when
 * off. The vendored one is the primary blue over the input border's grey, and
 * that grey vanishes against a white card in the light theme.
 *
 * Green because on means "in" everywhere a switch appears - in the library, in
 * the sim, on the Championships page - which is the success family's meaning
 * rather than the primary accent's. Here rather than in the vendored switch, so
 * that file stays as upstream ships it.
 */
export const SWITCH_TRACK = 'data-[state=checked]:bg-success data-[state=unchecked]:bg-muted-foreground/35 dark:data-[state=unchecked]:bg-muted-foreground/35';

/**
 * How many of a long list's values the rail shows, biggest first, before the
 * rest move into the flyout.
 */
export const RAIL_TOP = 5;

/**
 * How long a list may get before only its biggest values stay in the rail.
 */
export const RAIL_LONG = 8;

/**
 * The letters a flyout's index offers, whether or not anything starts with them.
 */
export const RAIL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * The dot beside each source in the rail, in the colour its chip wears on a card.
 */
export const SOURCE_DOT = {
  [ContentSource.BASE]: 'bg-provenance-base-foreground',
  [ContentSource.DLC]: 'bg-provenance-dlc-foreground',
  [ContentSource.MOD]: 'bg-provenance-mod-foreground',
} as const satisfies Record<ContentSource, string>;

/**
 * A card that is a link or a button as a whole: the card's own corners, with
 * the focus ring drawn round them. Full height, so the card inside stretches
 * to the tallest in its grid row however much it holds itself.
 */
export const CARD_LINK = 'block h-full w-full rounded-xl text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

/**
 * The same link laid over a card from inside it, for a card holding buttons of
 * its own, which sit above it - so nothing interactive is nested in the link.
 */
export const CARD_COVER = 'absolute inset-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

/**
 * The search box of a browser with a filter rail, matched to the sort button
 * and the layout switch beside it: card-coloured, as tall and as round.
 */
export const TOOLBAR_SEARCH = 'h-9 rounded-lg bg-card shadow-xs dark:bg-card';

/**
 * The label widths a rail list's skeleton cycles through, so its rows read as
 * names of different lengths rather than as one bar repeated.
 */
export const RAIL_SKELETON_WIDTHS = ['w-24', 'w-16', 'w-20', 'w-14', 'w-28'] as const;

/**
 * How many bars a range filter's skeleton draws for its histogram.
 */
export const RANGE_SKELETON_BINS = 24;

/**
 * The four provenance lists a query carries, in the order the source tree
 * lists them.
 */
export const PROVENANCE_LISTS = ['sources', 'packs', 'makers', 'distributors'] as const satisfies readonly (
  keyof ProvenancePicks
)[];

// Every destination in the app, and which of them navigation offers. Pure data:
// no React, no screens, nothing imported but types - so this stays cheap to
// reach for from anywhere in the renderer.

import type { NavEntry } from './types.ts';

/**
 * The pattern for every destination, keyed by route ID.
 *
 * These are patterns, not URLs - `:id` is a placeholder. They are what
 * `<Route path>` and `useMatch` want; anything rendering a link wants a URL
 * from `path` instead.
 *
 * Hash routes, because production loads the renderer off file:// - a path-based
 * router has nothing to resolve against there.
 */
export const ROUTE = {
  cars: '/cars',
  car: '/cars/:id',
  tracks: '/tracks',
  diagnostics: '/diagnostics',
} as const;

/**
 * The destinations navigation offers, in the order they are shown.
 *
 * Only the label lives here. Icons stay with the component that draws them,
 * which is what keeps this module free of React.
 *
 * When the browsers demote out of primary nav into a content area, a `section`
 * field on each entry is where that split belongs.
 */
export const NAV = [
  { id: 'cars', label: 'nav.cars' },
  { id: 'tracks', label: 'nav.tracks' },
  { id: 'diagnostics', label: 'nav.diagnostics' },
] as const satisfies readonly NavEntry[];

/**
 * A `:name` placeholder in a route pattern.
 */
export const PARAM_PLACEHOLDER = /:([\w-]+)/g;

/**
 * The characters encodeURIComponent escapes that a path segment need not.
 *
 * The sub-delimiters `$&+,;=` plus `:` and `@` are all legal in a path segment,
 * so escaping them only makes a URL harder to read.
 */
export const OVER_ESCAPED = /%(?:24|26|2B|2C|3A|3B|3D|40)/g;

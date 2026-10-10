// Every destination in the app, and which of them navigation offers. Pure data:
// no React, no screens, nothing imported but types - so this stays cheap to
// reach for from anywhere in the renderer.

import type { ParseKeys } from 'i18next';

import type { NavEntry, RouteId } from './types.ts';

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
  home: '/home',
  race: '/race',
  raceEvent: '/race/:id',
  calendar: '/calendar',
  event: '/calendar/:series/:round',
  championships: '/championships',
  championship: '/championships/:id',
  results: '/results',
  result: '/results/:file',
  cars: '/cars',
  car: '/cars/:id',
  tracks: '/tracks',
  track: '/tracks/:id',
  settings: '/settings',
  diagnostics: '/settings/diagnostics',
  settingsContent: '/settings/content',
  settingsClasses: '/settings/classes',
  settingsChampionships: '/settings/championships',
  settingsSources: '/settings/sources',
  settingsChampionship: '/settings/championships/:id',
  championshipNew: '/settings/championships/new',
  championshipEdit: '/settings/championships/:id/edit',
} as const;

/**
 * The search parameter a track page keeps its chosen layout in, so Back and a
 * link from a round both land on the layout rather than the whole circuit.
 */
export const TRACK_LAYOUT_PARAM = 'layout';

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
  { id: 'home', label: 'nav.home' },
  { id: 'race', label: 'nav.race' },
  { id: 'calendar', label: 'nav.calendar' },
  { id: 'championships', label: 'nav.championships' },
  { id: 'results', label: 'nav.results' },
  { id: 'cars', label: 'nav.cars' },
  { id: 'tracks', label: 'nav.tracks' },
  { id: 'settings', label: 'nav.settings' },
] as const satisfies readonly NavEntry[];

/**
 * What Back calls each destination when it leads there: the page's own name,
 * for a list, and what kind of page it is, for one showing a single thing -
 * which names itself once its data has loaded, so this is only ever its
 * stand-in.
 */
export const BACK_LABEL = {
  home: 'back.home',
  race: 'back.race',
  raceEvent: 'back.raceEvent',
  calendar: 'back.calendar',
  event: 'back.event',
  championships: 'back.championships',
  championship: 'back.championship',
  results: 'back.results',
  result: 'back.result',
  cars: 'back.cars',
  car: 'back.car',
  tracks: 'back.tracks',
  track: 'back.track',
  settings: 'back.settings',
  diagnostics: 'back.diagnostics',
  settingsContent: 'back.settingsContent',
  settingsClasses: 'back.settingsClasses',
  settingsChampionships: 'back.settingsChampionships',
  settingsSources: 'back.settingsSources',
  settingsChampionship: 'back.championship',
  championshipNew: 'back.championshipNew',
  championshipEdit: 'back.championshipEdit',
} as const satisfies Record<RouteId, ParseKeys>;

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

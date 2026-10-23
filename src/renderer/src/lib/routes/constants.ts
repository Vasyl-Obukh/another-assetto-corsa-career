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
  start: '/',
  careers: '/careers',
  careerNew: '/careers/new',
  standalones: '/standalones',
  standaloneNew: '/standalones/new',
  home: '/home',
  standalone: '/championship',
  race: '/race',
  raceEvent: '/race/:id',
  calendar: '/calendar',
  event: '/calendar/:series/:round',
  championships: '/championships',
  championship: '/championships/:id',
  results: '/home/results',
  result: '/home/results/:file',
  history: '/home/history',
  finances: '/home/finances',
  yearReview: '/home/history/:season',
  championshipReview: '/home/history/:season/:series/:edition',
  store: '/store',
  garage: '/garage',
  car: '/cars/:id',
  track: '/tracks/:id',
  settings: '/settings',
  settingsCareer: '/settings/career',
  diagnostics: '/settings/diagnostics',
  settingsContent: '/settings/content',
  settingsClasses: '/settings/classes',
  settingsChampionships: '/settings/championships',
  settingsSources: '/settings/sources',
  settingsChampionship: '/settings/championships/:id',
  championshipNew: '/settings/championships/new',
  championshipEdit: '/settings/championships/:id/edit',
  settingsHistoric: '/settings/historic',
  settingsHistoricEvent: '/settings/historic/:id',
  historicNew: '/settings/historic/new',
  historicEdit: '/settings/historic/:id/edit',
} as const;

/**
 * The search parameter a track page keeps its chosen layout in, so Back and a
 * link from a round both land on the layout rather than the whole circuit.
 */
export const TRACK_LAYOUT_PARAM = 'layout';

/**
 * The search parameters a championship's page and a round's page keep their
 * run in: which season and which of its editions. Absent, a page shows the
 * current season and the edition the career is racing, or else the one still
 * to come.
 */
export const RUN_PARAM = {
  season: 'season',
  edition: 'edition',
} as const;

/**
 * The search parameter a championship's page keeps its open tab in, so Back
 * from a round returns to the tab it left.
 */
export const DETAIL_TAB_PARAM = 'tab';

/**
 * The destinations a career's navigation offers, in the order they are shown.
 *
 * Only the label lives here. Icons stay with the component that draws them,
 * which is what keeps this module free of React.
 *
 * Results, History and Finances are deliberately not here: all three are
 * reached from Home, and live under its path so Home stays lit while any is
 * open. Settings opens on the career's own, and stays lit on the app's. A
 * car's page belongs to the Store, unless the Garage opened it. There is no
 * Tracks: a track browser is only ever a picker, and a circuit's page is
 * reached through a link.
 */
export const CAREER_NAV = [
  { id: 'home', label: 'nav.home' },
  { id: 'calendar', label: 'nav.calendar' },
  { id: 'championships', label: 'nav.championships' },
  { id: 'store', label: 'nav.store', also: ['car'] },
  { id: 'garage', label: 'nav.garage' },
  { id: 'settings', label: 'nav.settings', to: 'settingsCareer' },
] as const satisfies readonly NavEntry[];

/**
 * The destinations a standalone championship's navigation offers. Its own page
 * is its home, and stays lit on its rounds' pages and on its review, which are
 * the career's own pages under paths of their own.
 */
export const CHAMPIONSHIP_NAV = [
  { id: 'standalone', label: 'nav.championship', also: ['championship', 'event', 'championshipReview'] },
  { id: 'results', label: 'nav.results' },
  { id: 'settings', label: 'nav.settings', to: 'settingsCareer' },
] as const satisfies readonly NavEntry[];

/**
 * The destinations quick race mode's navigation offers. Cars and tracks are
 * picked inside a race, so neither has a tab of its own here.
 */
export const QUICK_NAV = [
  { id: 'race', label: 'nav.races' },
  { id: 'results', label: 'nav.results' },
  { id: 'settings', label: 'nav.settings' },
] as const satisfies readonly NavEntry[];

/**
 * What Back calls each destination when it leads there: the page's own name,
 * for a list, and what kind of page it is, for one showing a single thing -
 * which names itself once its data has loaded, so this is only ever its
 * stand-in.
 */
export const BACK_LABEL = {
  start: 'back.start',
  careers: 'back.careers',
  careerNew: 'back.careerNew',
  standalones: 'back.standalones',
  standaloneNew: 'back.standaloneNew',
  home: 'back.home',
  standalone: 'back.standalone',
  race: 'back.race',
  raceEvent: 'back.raceEvent',
  calendar: 'back.calendar',
  event: 'back.event',
  championships: 'back.championships',
  championship: 'back.championship',
  results: 'back.results',
  result: 'back.result',
  history: 'back.history',
  finances: 'back.finances',
  yearReview: 'back.yearReview',
  championshipReview: 'back.championshipReview',
  store: 'back.store',
  garage: 'back.garage',
  car: 'back.car',
  track: 'back.track',
  settings: 'back.settings',
  settingsCareer: 'back.settings',
  diagnostics: 'back.diagnostics',
  settingsContent: 'back.settingsContent',
  settingsClasses: 'back.settingsClasses',
  settingsChampionships: 'back.settingsChampionships',
  settingsSources: 'back.settingsSources',
  settingsChampionship: 'back.championship',
  championshipNew: 'back.championshipNew',
  championshipEdit: 'back.championshipEdit',
  settingsHistoric: 'back.settingsHistoric',
  settingsHistoricEvent: 'back.historicEvent',
  historicNew: 'back.historicNew',
  historicEdit: 'back.historicEdit',
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

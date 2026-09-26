// Turning route patterns into the URLs links and navigations use.
//
// Two things that read alike and are not, and only agree when a destination
// takes no parameters:
//
//   ROUTE.car    '/cars/:id'          the pattern - <Route path>, useMatch
//   path.car()   '/cars/ks_ferrari'   the URL     - <Link to>, navigate, <Navigate>
//
// react-router's own generatePath does exactly what buildPath does and is
// deliberately not used: the package is ESM-only and its graph reaches an
// `import.meta.hot`, which the CommonJS Jest compiles to cannot express, so
// importing it would put this module and its dependents out of reach of the
// suite. The type-only import in types.ts is erased before either sees it.

import {
  NAV, OVER_ESCAPED, PARAM_PLACEHOLDER, ROUTE, TRACK_LAYOUT_PARAM,
} from './constants.ts';
import type { NavId, RouteId, RouteParams } from './types.ts';

/**
 * Encodes one path segment the way a URL wants it.
 *
 * `encodeURIComponent` is deliberately over-eager - it escapes the sub-delimiters
 * `$&+,;=`, plus `:` and `@`, which are all legal in a path segment and read
 * badly when escaped. They are put back, which is what react-router's own
 * generatePath does.
 * @param value The raw parameter value
 * @returns The value, safe to sit in a path
 */
const encodeSegment = (value: string): string => (
  encodeURIComponent(value).replace(OVER_ESCAPED, decodeURIComponent)
);

/**
 * Fills a route pattern's placeholders in to make a URL.
 *
 * Only required `:name` placeholders are understood - not react-router's
 * optional `:name?` or its trailing `*`. Neither is used by any route here, and
 * adding one is the moment to teach this function about it rather than now.
 * @param pattern The route pattern to fill in
 * @param params A value for every placeholder the pattern carries
 * @returns The URL to navigate to
 * @throws When a placeholder has no value, which the types should have prevented
 */
export const buildPath = <P extends string>(pattern: P, params: RouteParams<P>): string => (
  pattern.replace(PARAM_PLACEHOLDER, (placeholder, name: string) => {
    // The one place the pattern's derived key type has to become an ordinary
    // lookup; everything above this line is checked.
    const value = (params as Readonly<Record<string, string | undefined>>)[name];
    if (value === undefined) throw new Error(`Route ${pattern} is missing ${placeholder}`);

    return encodeSegment(value);
  })
);

/**
 * How many placeholders a route pattern carries.
 * @param pattern The pattern
 * @returns Its `:name` count
 */
const placeholders = (pattern: string): number => pattern.match(PARAM_PLACEHOLDER)?.length ?? 0;

/**
 * Which destination a URL path is, the reverse of `path`.
 *
 * Patterns with fewer placeholders are tried first, so a literal such as
 * `/settings/championships/new` is never read as one championship's page.
 * @param pathname The path, as `useLocation` reports it
 * @returns The route's ID, or null for a path no route matches
 */
export const routeOf = (pathname: string): RouteId | null => {
  const ids = (Object.keys(ROUTE) as RouteId[])
    .sort((a, b) => placeholders(ROUTE[a]) - placeholders(ROUTE[b]));

  return ids.find((id) => new RegExp(`^${ROUTE[id].replace(PARAM_PLACEHOLDER, '[^/]+')}/?$`).test(pathname))
    ?? null;
};

/**
 * The section a page's router state says navigation should light.
 * @param state The location's state, whatever pushed it
 * @returns The section a `NavState` names, or null for any other state
 */
export const sectionOf = (state: unknown): NavId | null => {
  if (typeof state !== 'object' || state === null || !('section' in state)) return null;
  const { section } = state;

  return NAV.find((entry) => entry.id === section)?.id ?? null;
};

/**
 * The URL for every destination, keyed by route ID.
 *
 * Always a call, even where a destination takes no parameters, so there is one
 * way to ask for a URL rather than two.
 */
export const path = {
  /**
   * The career's home page, where the app opens.
   * @returns Its URL
   */
  home: (): string => ROUTE.home,
  /**
   * Every race weekend of the player's own.
   * @returns Its URL
   */
  race: (): string => ROUTE.race,
  /**
   * One race weekend of the player's own, where it is set up and run.
   * @param params The race's id
   * @returns Its URL, with the id encoded
   */
  raceWeekend: (
    params: RouteParams<typeof ROUTE.raceWeekend>,
  ): string => buildPath(ROUTE.raceWeekend, params),
  /**
   * The career's calendar.
   * @returns Its URL
   */
  calendar: (): string => ROUTE.calendar,
  /**
   * One round of the career's season, where its sessions are run.
   * @param params The championship's and the round's ids
   * @returns Its URL, with both ids encoded
   */
  event: (
    params: RouteParams<typeof ROUTE.event>,
  ): string => buildPath(ROUTE.event, params),
  /**
   * The list of shipped championships.
   * @returns Its URL
   */
  championships: (): string => ROUTE.championships,
  /**
   * One championship's page.
   * @param params The championship's id
   * @returns Its URL, with the id encoded
   */
  championship: (
    params: RouteParams<typeof ROUTE.championship>,
  ): string => buildPath(ROUTE.championship, params),
  /**
   * The list of archived results.
   * @returns Its URL
   */
  results: (): string => ROUTE.results,
  /**
   * One archived result.
   * @param params The archive's file name
   * @returns Its URL, with the file name encoded
   */
  result: (params: RouteParams<typeof ROUTE.result>): string => buildPath(ROUTE.result, params),
  /**
   * The settings screen, on its General tab.
   * @returns Its URL
   */
  settings: (): string => ROUTE.settings,
  /**
   * The settings screen's Your content tab, which adds anonymous mods to the
   * library.
   * @returns Its URL
   */
  settingsContent: (): string => ROUTE.settingsContent,
  /**
   * The settings screen's Classes tab, where the user makes classes and specs
   * of their own.
   * @returns Its URL
   */
  settingsClasses: (): string => ROUTE.settingsClasses,
  /**
   * The settings screen's Championships tab, where the championship library is
   * managed.
   * @returns Its URL
   */
  settingsChampionships: (): string => ROUTE.settingsChampionships,
  /**
   * The settings screen's Content sources tab, which decides which of the
   * app's own championships are offered.
   * @returns Its URL
   */
  settingsSources: (): string => ROUTE.settingsSources,
  /**
   * One championship's page as the settings tab opens it: the same page a
   * career reads, with nothing on it that races a round.
   * @param params The championship's id
   * @returns Its URL, with the id encoded
   */
  settingsChampionship: (
    params: RouteParams<typeof ROUTE.settingsChampionship>,
  ): string => buildPath(ROUTE.settingsChampionship, params),
  /**
   * The editor, on a championship that does not exist yet. Nothing is written
   * until the first save.
   * @returns Its URL
   */
  championshipNew: (): string => ROUTE.championshipNew,
  /**
   * One championship's editor. Under settings, since that is where the library
   * is managed - the Championships page itself never edits anything.
   * @param params The championship's id
   * @returns Its URL, with the id encoded
   */
  championshipEdit: (
    params: RouteParams<typeof ROUTE.championshipEdit>,
  ): string => buildPath(ROUTE.championshipEdit, params),
  /**
   * The car browser.
   * @returns Its URL
   */
  cars: (): string => ROUTE.cars,
  /**
   * One car's page.
   * @param params The car's folder name
   * @returns Its URL, with the folder name encoded
   */
  car: (params: RouteParams<typeof ROUTE.car>): string => buildPath(ROUTE.car, params),
  /**
   * The track browser.
   * @returns Its URL
   */
  tracks: (): string => ROUTE.tracks,
  /**
   * One circuit's page.
   * @param params The circuit's folder name
   * @param layout A layout to open it on, rather than on the whole circuit
   * @returns Its URL, with the folder name encoded
   */
  track: (params: RouteParams<typeof ROUTE.track>, layout?: string): string => buildPath(ROUTE.track, params)
    + (layout ? `?${TRACK_LAYOUT_PARAM}=${encodeURIComponent(layout)}` : ''),
  /**
   * The settings screen's Diagnostics tab: where Assetto Corsa lives and what
   * the content scan found.
   * @returns Its URL
   */
  diagnostics: (): string => ROUTE.diagnostics,
};

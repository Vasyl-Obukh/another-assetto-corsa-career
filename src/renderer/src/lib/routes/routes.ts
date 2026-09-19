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

import { OVER_ESCAPED, PARAM_PLACEHOLDER, ROUTE } from './constants.ts';
import type { RouteParams } from './types.ts';

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
 * The URL for every destination, keyed by route ID.
 *
 * Always a call, even where a destination takes no parameters, so there is one
 * way to ask for a URL rather than two.
 */
export const path = {
  /**
   * The race setup screen.
   * @returns Its URL
   */
  race: (): string => ROUTE.race,
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
   * The settings screen's Diagnostics tab: where Assetto Corsa lives and what
   * the content scan found.
   * @returns Its URL
   */
  diagnostics: (): string => ROUTE.diagnostics,
};

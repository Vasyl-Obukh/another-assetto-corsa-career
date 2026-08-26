// Turning route patterns into the URLs links and navigations use.
//
// Two things that read alike and are not:
//
//   ROUTE.car    '/cars/:id'          the pattern - <Route path>, useMatch
//   path.car()   '/cars/ks_ferrari'   the URL     - <Link to>, navigate, <Navigate>
//
// They are the same string only for a destination that takes no parameters, so
// reaching for whichever is to hand works right up until it does not.
//
// react-router ships generatePath, which does exactly what buildPath does here,
// and it is deliberately not used. It is an ESM-only package whose graph reaches
// an `import.meta.hot`, and that cannot be expressed in the CommonJS Jest
// compiles to - importing it would put this module, and everything importing it,
// out of reach of the test suite. Teaching Jest to transform the package was
// tried and gets as far as that same `import.meta`. The type-only import in
// types.ts is free, being erased before either bundler or test runner sees it.

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
    // The cast is the one place the pattern's derived key type has to become an
    // ordinary lookup; everything above this line is checked.
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
   * The diagnostics screen.
   * @returns Its URL
   */
  diagnostics: (): string => ROUTE.diagnostics,
};

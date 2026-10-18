import type { ParseKeys } from 'i18next';
import type { PathParam } from 'react-router';

import type {
  CAREER_NAV, CHAMPIONSHIP_NAV, QUICK_NAV, ROUTE,
} from './constants.ts';

/**
 * The name of a destination.
 */
export type RouteId = keyof typeof ROUTE;

/**
 * A route pattern, as `<Route path>` and `useMatch` want it.
 */
export type RoutePattern = (typeof ROUTE)[RouteId];

/**
 * The parameters one pattern needs, derived from the pattern itself.
 *
 * `PathParam` is react-router's own reader of `:name` placeholders out of a
 * pattern string, imported as a type so nothing of react-router reaches the
 * bundle or the test runner. Adding a placeholder to a pattern therefore turns
 * every call site of its builder into a compile error until it is passed.
 */
export type RouteParams<P extends string> = Readonly<Record<PathParam<P>, string>>;

/**
 * One entry in the navigation bar.
 */
export interface NavEntry {
  /**
   * Which destination it leads to.
   */
  id: RouteId;
  /**
   * The catalogue key for its label.
   */
  label: ParseKeys;
  /**
   * Where it leads, when that is not the destination it stays lit for - a
   * career's Settings opens on the career's own and stays lit on the app's.
   */
  to?: RouteId;
  /**
   * Other destinations it stays lit on, for pages that belong to it without
   * living under its path.
   */
  also?: readonly RouteId[];
}

/**
 * The name of a destination navigation offers.
 *
 * Narrower than RouteId: only the destinations actually listed in NAV, which is
 * what lets their paths be built without arguments.
 */
export type NavId = (typeof CAREER_NAV | typeof CHAMPIONSHIP_NAV | typeof QUICK_NAV)[number]['id'];

/**
 * The router state a link carries when the page it opens belongs, for
 * navigation's purposes, to the section it was opened from rather than its own -
 * a car opened from Settings keeps Settings lit.
 */
export interface NavState {
  /**
   * The destination navigation lights while the page is open.
   */
  section: NavId;
}

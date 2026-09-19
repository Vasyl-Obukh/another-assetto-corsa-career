import type { ParseKeys } from 'i18next';
import type { PathParam } from 'react-router';

import type { NAV, ROUTE } from './constants.ts';

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
}

/**
 * The name of a destination navigation offers.
 *
 * Narrower than RouteId: only the destinations actually listed in NAV, which is
 * what lets their paths be built without arguments.
 */
export type NavId = (typeof NAV)[number]['id'];

/**
 * The navigation state a screen with a Back of its own is opened with, when
 * it can be reached from more than one place and Back should lead to the one
 * the user came from - the championship editor, say, opened from a card or
 * from a championship's own page.
 */
export interface ReturnState {
  /**
   * The URL Back leads to.
   */
  to: string;
  /**
   * The catalogue key for Back's label.
   */
  label: ParseKeys;
}

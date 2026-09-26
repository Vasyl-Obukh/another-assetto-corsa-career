import type { Visit, VisitAction } from './types.ts';

// The window's own history, position by position, so Back can say which page
// it returns to. Module state, like browser memory: nothing renders from it,
// it lasts as long as the window, and a reload starts it empty - which leaves
// Back on each screen's fixed parent until there is somewhere to go back to.
const VISITS: (Omit<Visit, 'name'> | undefined)[] = [];
const NAMES = new Map<string, string>();

/**
 * Records the page the window is now on.
 *
 * A push starts a new future, so everything after it is dropped - exactly as
 * the browser drops its forward entries.
 * @param index The entry's position in the window's history
 * @param key The router's key for the entry
 * @param pathname The path it shows
 * @param action How the window arrived there
 */
export const recordVisit = (index: number, key: string, pathname: string, action: VisitAction): void => {
  if (action === 'PUSH') VISITS.length = index;
  VISITS[index] = { key, pathname };
};

/**
 * Records what a page calls itself, for Back on the page after it to say.
 * @param key The router's key for the page's entry
 * @param name Its name, already translated
 */
export const nameVisit = (key: string, name: string): void => {
  NAMES.set(key, name);
};

/**
 * The page before the one at a position, if this window has been on it.
 * @param index The current entry's position
 * @returns That page, or null at the first entry or after a reload
 */
export const previousVisit = (index: number): Visit | null => {
  const visit = index > 0 ? VISITS[index - 1] : undefined;

  return visit ? { ...visit, name: NAMES.get(visit.key) ?? null } : null;
};

/**
 * Whether the window has been somewhere after the entry at a position, which
 * is where going forward leads.
 * @param index The current entry's position
 * @returns Whether there is a next entry
 */
export const hasNextVisit = (index: number): boolean => VISITS[index + 1] !== undefined;

/**
 * Forgets every page, as a fresh window would.
 */
export const forgetVisits = (): void => {
  VISITS.length = 0;
  NAMES.clear();
};

/**
 * The current entry's position in the window's history, which the router
 * keeps on `history.state` as `idx`.
 * @returns The position, or 0 where the router has not stamped one
 */
export const currentIndex = (): number => {
  const state = window.history.state as { idx?: unknown } | null;

  return typeof state?.idx === 'number' ? state.idx : 0;
};

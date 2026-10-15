import { EMPTY_MEMORY } from './constants.ts';
import type { BrowserMemory, BrowserView } from './types.ts';

// Module-level rather than React state or storage, and each for its own reason.
// State cannot outlive the route that owns it, which is exactly what has to
// happen here. Storage would outlive the window, and filters restored days
// later would read as the app having lost the library rather than as a
// convenience. A module holds it for as long as the window does, which is what
// "where I was" means.
const MEMORY = new Map<string, BrowserMemory<unknown>>();

/**
 * What a browser last recorded.
 *
 * A snapshot rather than the stored object, so a caller holding it across a
 * render is not reading later writes as though they were the mount-time
 * answer.
 * @param id Which browser, or undefined for one that remembers nothing
 * @returns Its memory, or an empty one
 */
export const readBrowserMemory = <C>(id: string | undefined): BrowserMemory<C> => {
  const held = id === undefined ? undefined : MEMORY.get(id);

  return { ...(held ?? EMPTY_MEMORY) } as BrowserMemory<C>;
};

/**
 * Records part of where a browser is now.
 *
 * A no-op without an id, which is what a picker passes: its browser is opened
 * onto a restricted library for one question and should not carry filters into
 * or out of the page that browses the whole one.
 * @param id Which browser, or undefined for one that remembers nothing
 * @param patch The fields that changed
 */
export const rememberBrowser = <C>(
  id: string | undefined,
  patch: Partial<BrowserMemory<C>>,
): void => {
  if (id === undefined) return;

  MEMORY.set(id, { ...(MEMORY.get(id) ?? EMPTY_MEMORY), ...patch });
};

/**
 * Reads a stored choice of cards or a table, falling back to cards.
 * @param stored Whatever was stored
 * @returns Cards or a table
 */
export const readBrowserView = (stored: unknown): BrowserView => (stored === 'list' ? 'list' : 'cards');

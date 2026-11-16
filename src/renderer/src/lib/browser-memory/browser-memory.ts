import { BROWSER_VIEWS, EMPTY_MEMORY } from './constants.ts';
import type { BrowserMemory } from './types.ts';
import { readOneOf } from '@/lib/stored-preference';

// Module-level rather than React state or storage, and each for its own reason.
// State cannot outlive the route that owns it, which is exactly what has to
// happen here. Storage would outlive the window, and a search restored days
// later would read as the app having lost the list rather than as a
// convenience. A module holds it for as long as the window does, which is what
// "where I was" means.
const MEMORY = new Map<string, BrowserMemory>();

/**
 * What a list last recorded.
 *
 * A snapshot rather than the stored object, so a caller holding it across a
 * render is not reading later writes as though they were the mount-time
 * answer.
 * @param id Which list, or undefined for one that remembers nothing
 * @returns Its memory, or an empty one
 */
export const readBrowserMemory = (id: string | undefined): BrowserMemory => {
  const held = id === undefined ? undefined : MEMORY.get(id);

  return { ...(held ?? EMPTY_MEMORY) };
};

/**
 * Records part of where a list is now.
 *
 * A no-op without an id, which is what a picker passes: it is opened onto a
 * restricted list for one question and should not carry a search into or out
 * of the page that browses the whole one.
 * @param id Which list, or undefined for one that remembers nothing
 * @param patch The fields that changed
 */
export const rememberBrowser = (id: string | undefined, patch: Partial<BrowserMemory>): void => {
  if (id === undefined) return;

  MEMORY.set(id, { ...(MEMORY.get(id) ?? EMPTY_MEMORY), ...patch });
};

/**
 * Reads a stored choice of cards or a table, falling back to cards.
 */
export const readBrowserView = readOneOf(BROWSER_VIEWS, 'cards');

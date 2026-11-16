import type { BrowserMemory } from './types.ts';

/**
 * What a list that has never been visited remembers.
 */
export const EMPTY_MEMORY: BrowserMemory = {
  search: '',
  scroll: 0,
};

/**
 * Every way a browser can lay out what it found.
 */
export const BROWSER_VIEWS = ['cards', 'list'] as const;

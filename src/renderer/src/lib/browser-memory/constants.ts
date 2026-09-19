import type { BrowserMemory } from './types.ts';

/**
 * What a browser that has never been visited remembers.
 */
export const EMPTY_MEMORY: BrowserMemory<never> = {
  search: '',
  criteria: null,
  scroll: 0,
};

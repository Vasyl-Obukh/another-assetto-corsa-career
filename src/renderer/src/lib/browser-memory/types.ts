import type { BROWSER_VIEWS } from './constants.ts';

/**
 * Where a list was when it was last left, for as long as the window is open:
 * what was typed into its search box and how far it was scrolled. Its filters,
 * sort and layout are stored preferences instead, since those outlive a restart.
 */
export interface BrowserMemory {
  /**
   * The search box's text.
   */
  search: string;
  /**
   * How far down the list had been scrolled, in pixels. Only a list rendered
   * whole restores it - the championship lists - since a paged browser would
   * have to page every entry above it back in first.
   */
  scroll: number;
}

/**
 * How a browser lays out what it found: a grid of cards, or a table to
 * compare across.
 */
export type BrowserView = typeof BROWSER_VIEWS[number];

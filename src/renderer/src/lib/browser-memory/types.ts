/**
 * What a browser was showing when it was last left.
 *
 * Generic over the criteria because the two browsers filter on different
 * things; the store itself holds them as `unknown` and hands them back as
 * whatever the caller asks for, which is safe only because an id belongs to
 * exactly one browser.
 */
export interface BrowserMemory<C> {
  /**
   * The search box's text.
   */
  search: string;
  /**
   * The filters and sort that were applied, or null when the browser has not
   * been visited yet.
   */
  criteria: C | null;
  /**
   * How far down the list had been scrolled, in pixels. Only a list rendered
   * whole restores it - the championship lists - since a paged browser would
   * have to page every entry above it back in first.
   */
  scroll: number;
}

/**
 * How many entries a page holds when the caller does not say.
 */
export const DEFAULT_PAGE_SIZE = 50;

/**
 * The most entries one page may hold.
 *
 * The renderer is sandboxed but not trusted with authoritative reads either; a
 * request for a million rows should come back as five hundred, not lock main up
 * serialising a whole mod library.
 */
export const MAX_PAGE_SIZE = 500;

/**
 * How display names are ordered.
 *
 * One instance rather than a localeCompare per comparison, which matters over a
 * few thousand entries. `numeric` is what puts Formula 2 before Formula 10, and
 * base sensitivity is what makes a search for "citroen" order alongside
 * "Citroën".
 */
export const COLLATOR = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

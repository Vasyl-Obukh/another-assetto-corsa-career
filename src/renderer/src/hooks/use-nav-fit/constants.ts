/**
 * What an item's label stamps on its markup for useNavFit to measure it.
 */
export const NAV_FIT_LABEL = { 'data-nav-label': '' } as const;

/**
 * Nothing hidden, shared so a row that fits keeps one value across renders.
 */
export const NO_ITEMS: ReadonlySet<string> = new Set();

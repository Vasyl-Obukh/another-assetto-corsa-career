/**
 * What an item stamps on its markup for useNavFit to find and measure it.
 * @param id What the hook names it by, unique within its row
 * @param compact Whether it is showing its icon alone
 * @param last Whether it gives its label up only after every other item
 * @returns The attributes to spread onto the item's element
 */
export const navFitItem = (id: string, compact: boolean, last = false): Record<string, string | undefined> => ({
  'data-nav-item': id,
  'data-compact': compact ? '' : undefined,
  'data-nav-last': last ? '' : undefined,
});

/**
 * Puts a row's items in the order their labels give way: from the right, and
 * the ones held back until last after all the rest.
 * @param items The items, left to right
 * @param isLast Whether an item gives its label up only after every other one
 * @returns The same items, first to give way first
 */
export const inGivingOrder = <T>(items: readonly T[], isLast: (item: T) => boolean): T[] => [
  ...items.filter((item) => !isLast(item)).reverse(),
  ...items.filter(isLast),
];

/**
 * How many labels have to be hidden, in giving order, to win back the room a
 * row is short of.
 * @param widths What showing each label takes, in pixels, in giving order
 * @param short How far the row would overflow with every label showing; zero
 *   or less when it fits
 * @returns How many labels to hide, from the first; all of them when even that
 *   is not enough
 */
export const labelsToHide = (widths: readonly number[], short: number): number => {
  let count = 0;
  let freed = 0;
  // Half a pixel's grace for widths that do not add up exactly.
  while (freed < short - 0.5 && count < widths.length) {
    freed += widths[count];
    count += 1;
  }

  return count;
};

/**
 * A length read off computed style, or zero for one that is not a length, such
 * as a gap left at "normal".
 * @param value The computed value
 * @returns The length in pixels
 */
export const pixels = (value: string): number => parseFloat(value) || 0;

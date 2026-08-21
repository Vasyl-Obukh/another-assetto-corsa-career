/**
 * How many entries one page asks for.
 *
 * A multiple of two, three and four, so the last row of the grid is never ragged
 * at any of its column counts. Well under the 500 main clamps to: the cost here
 * is preview images being decoded, not rows being appended.
 */
export const PAGE_SIZE = 60;

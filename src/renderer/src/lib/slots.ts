// Positions for a skeleton's repeated rows. A placeholder row is told apart
// only by where it sits, so its position is its key.

/**
 * The positions of a run of placeholders, to map over.
 * @param count How many there are
 * @returns 0 up to count - 1
 */
export const slots = (count: number): number[] => Array.from({ length: count }, (unused, at) => at);

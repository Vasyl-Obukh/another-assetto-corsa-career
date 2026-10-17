/**
 * The career a link to the Careers list asks to arrive on - the start screen's
 * Load hands over the one played last.
 * @param state The router state the link carried
 * @returns The career's id, or null when it named none
 */
export const pickOf = (state: unknown): string | null => {
  if (typeof state !== 'object' || state === null || !('pick' in state)) return null;
  const { pick } = state;

  return typeof pick === 'string' ? pick : null;
};

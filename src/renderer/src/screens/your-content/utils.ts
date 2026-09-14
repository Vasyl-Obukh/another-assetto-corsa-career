/**
 * Adds an ID to a list or takes it out.
 * @param current The list as it stands
 * @param id The folder ID to add or remove
 * @param on True to add it, false to remove it
 * @returns A new list, each ID once and sorted the way settings stores it
 */
export const withId = (current: readonly string[], id: string, on: boolean): string[] => (
  on ? [...new Set([...current, id])].sort() : current.filter((entry) => entry !== id)
);

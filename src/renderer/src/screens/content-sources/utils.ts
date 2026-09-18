/**
 * Switches one value in or out of a list, keeping the list in a fixed order so
 * settings.json diffs cleanly.
 * @param list The list as it stands
 * @param value The value to switch
 * @param order Every value, in the order to keep
 * @returns The list with the value added when it was absent, removed otherwise
 */
export const toggled = <T extends string>(list: readonly T[], value: T, order: readonly T[]): T[] => {
  const next = new Set(list);
  if (next.has(value)) next.delete(value);
  else next.add(value);

  return order.filter((each) => next.has(each));
};

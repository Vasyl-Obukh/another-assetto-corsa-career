/**
 * Switches one value in or out of a list, keeping the list in a fixed order so
 * settings.json diffs cleanly.
 * @param list The list as it stands
 * @param value The value to switch
 * @param order Every value, in the order to keep
 * @returns The list with the value added when it was absent, removed otherwise
 */
export const toggled = <T>(list: readonly T[], value: T, order: readonly T[]): T[] => {
  const next = new Set(list);
  if (next.has(value)) next.delete(value);
  else next.add(value);

  return order.filter((each) => next.has(each));
};

/**
 * The host a link goes to, which is what the link says.
 *
 * Shown rather than a word like "Steam" because where the user is about to be
 * sent is the thing worth stating, and a host is data rather than copy.
 * @param url The absolute URL
 * @returns Its host, or the URL itself when it will not parse
 */
export const hostOf = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

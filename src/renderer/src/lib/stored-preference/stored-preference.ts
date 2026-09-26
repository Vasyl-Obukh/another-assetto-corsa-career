// A screen's own preferences, kept in the renderer's localStorage so they
// outlive the window - unlike browser-memory, which a restart is meant to
// forget. Only for how a screen is laid out and filtered: nothing a career or
// a championship depends on, so losing it costs a click and nothing more.
//
// Every access is guarded, since storage can be unavailable or hold something
// that is not JSON, and neither may stop a screen opening.

/**
 * Reads what a preference was last saved as.
 *
 * Unknown rather than typed: whatever is stored may predate the screen's
 * current shape, so the caller narrows it before trusting it.
 * @param key Which preference
 * @returns The stored value, or undefined when there is none or it cannot be read
 */
export const readPreference = (key: string): unknown => {
  try {
    const held = window.localStorage.getItem(key);

    return held === null ? undefined : JSON.parse(held) as unknown;
  } catch {
    return undefined;
  }
};

/**
 * Saves a preference, quietly giving up where storage is unavailable.
 * @param key Which preference
 * @param value What to save, which must survive JSON
 */
export const writePreference = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A preference that cannot be saved is simply not remembered.
  }
};

import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { readPreference, writePreference } from '@/lib/stored-preference';

/**
 * Each preference's live readers, so a change made in one is shown by every
 * other on screen at the time - the Careers page's saves and the Load dialog's.
 */
const LISTENERS = new Map<string, Set<(value: unknown) => void>>();

/**
 * A preference as one reader holds it.
 */
interface Held<T> {
  /**
   * Which preference.
   */
  key: string;
  /**
   * Its value.
   */
  value: T;
  /**
   * Whether the value is already stored, being what was read or what another
   * reader saved, so there is nothing to write.
   */
  stored: boolean;
}

/**
 * A screen's filter, sort or layout, opened on what it was last left as and
 * saved whenever it changes, across restarts.
 * @param key Where it is stored
 * @param read Narrows whatever is stored, which may predate the screen, into
 *   the value to open on
 * @param toStored What of the value is saved, when not all of it should outlive
 *   the screen
 * @returns The value and its setter, as `useState` gives them
 */
export const usePreference = <T>(
  key: string,
  read: (stored: unknown) => T,
  toStored?: (value: T) => unknown,
): [T, Dispatch<SetStateAction<T>>] => {
  const [held, setHeld] = useState<Held<T>>(() => ({ key, value: read(readPreference(key)), stored: true }));
  // Another key is another preference: read it rather than carry this one over.
  if (held.key !== key) setHeld({ key, value: read(readPreference(key)), stored: true });

  const hear = useCallback((value: unknown) => setHeld({ key, value: value as T, stored: true }), [key]);

  useEffect(() => {
    const listeners = LISTENERS.get(key) ?? new Set();
    LISTENERS.set(key, listeners.add(hear));

    return () => { listeners.delete(hear); };
  }, [key, hear]);

  useEffect(() => {
    if (held.stored) return;

    writePreference(held.key, toStored ? toStored(held.value) : held.value);
    LISTENERS.get(held.key)?.forEach((listener) => { if (listener !== hear) listener(held.value); });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a caller's inline toStored would save on every render
  }, [held, hear]);

  const set = useCallback((next: SetStateAction<T>) => setHeld((prev) => ({
    key: prev.key,
    value: typeof next === 'function' ? (next as (value: T) => T)(prev.value) : next,
    stored: false,
  })), []);

  return [held.value, set];
};

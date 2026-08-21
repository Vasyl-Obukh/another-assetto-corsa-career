import { useEffect, useState } from 'react';

/**
 * Follows a value, but only once it has stopped changing.
 *
 * Typing into the search box should not be one IPC call per keystroke, and the
 * input itself stays controlled by the raw value so it never feels laggy.
 * @param value The value to follow
 * @param delayMs How long the value has to stay still before it settles
 * @returns The last settled value
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);

    return () => { clearTimeout(timer); };
  }, [value, delayMs]);

  return settled;
};

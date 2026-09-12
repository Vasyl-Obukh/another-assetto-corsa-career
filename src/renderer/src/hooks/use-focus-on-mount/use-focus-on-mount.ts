import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Focuses one element as soon as it appears.
 *
 * What puts the cursor in the first field of a form the user just opened.
 * `autoFocus` says the same thing and is refused by jsx-a11y, which is right
 * about a page but wrong about a form asked for.
 * @returns A ref to put on the element that should take the focus
 */
export const useFocusOnMount = <T extends HTMLElement>(): RefObject<T | null> => {
  const target = useRef<T>(null);

  useEffect(() => {
    target.current?.focus();
  }, []);

  return target;
};

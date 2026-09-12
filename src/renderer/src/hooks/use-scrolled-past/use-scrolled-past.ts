import { useEffect, useState } from 'react';

import { BACK_TO_TOP_THRESHOLD } from './constants.ts';

/**
 * Whether an element has been scrolled further than a threshold.
 *
 * State changes only when the threshold is crossed, not on every scroll event,
 * so a page being scrolled does not re-render whatever reads this.
 * @param element The scrolling element, or null before it has mounted
 * @param threshold How far, in pixels
 * @returns True once it has scrolled past
 */
export const useScrolledPast = (
  element: HTMLElement | null,
  threshold = BACK_TO_TOP_THRESHOLD,
): boolean => {
  const [past, setPast] = useState(false);

  useEffect(() => {
    if (!element) return undefined;

    /**
     * Reads the offset and records which side of the threshold it is on.
     */
    const read = (): void => setPast(element.scrollTop > threshold);

    read();
    element.addEventListener('scroll', read, { passive: true });

    return () => element.removeEventListener('scroll', read);
  }, [element, threshold]);

  return past;
};

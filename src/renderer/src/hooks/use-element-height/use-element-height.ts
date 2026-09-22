import { useEffect, useState } from 'react';

/**
 * An element's height, kept current as it changes.
 *
 * For whatever has to sit clear of a pinned block whose height depends on its
 * content - a header that wraps onto a second line at a narrow width, or grows
 * an error card.
 * @param element The element to measure, or null before it has mounted
 * @returns Its height in pixels, or 0 while there is nothing to measure
 */
export const useElementHeight = (element: HTMLElement | null): number => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!element) return undefined;

    // A ResizeObserver reports once as soon as it starts observing, so this is
    // also what takes the first measurement.
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return height;
};

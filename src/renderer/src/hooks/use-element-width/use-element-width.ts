import { useEffect, useState } from 'react';

/**
 * An element's width, kept current as it changes.
 *
 * For a chart that draws to the room it is given rather than stretching a
 * fixed drawing, which would stretch its labels with it.
 * @param element The element to measure, or null before it has mounted
 * @returns Its width in pixels, or 0 while there is nothing to measure
 */
export const useElementWidth = (element: HTMLElement | null): number => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!element) return undefined;

    // A ResizeObserver reports once as soon as it starts observing, so this is
    // also what takes the first measurement.
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return width;
};

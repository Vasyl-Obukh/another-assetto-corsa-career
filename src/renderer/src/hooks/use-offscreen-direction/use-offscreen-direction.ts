import { useEffect, useState } from 'react';

import type { OffscreenDirection } from './types.ts';

export type { OffscreenDirection } from './types.ts';

/**
 * Which way an element lies from what a scroller is showing.
 *
 * An IntersectionObserver rather than a scroll listener, so state changes only
 * when the element crosses the edge of the view and scrolling a long page does
 * not re-render whatever reads this.
 *
 * `topInset` is for a scroller with a block pinned across its top: an element
 * sitting under that block is covered rather than in view, so the view is taken
 * to start below it.
 * @param scroller The scrolling element, or null before it has mounted
 * @param target The element to watch, or null when there is none
 * @param topInset How much of the scroller's top is covered, in pixels
 * @returns "up" when it is above the view, "down" when below, null when in it
 */
export const useOffscreenDirection = (
  scroller: HTMLElement | null,
  target: HTMLElement | null,
  topInset = 0,
): OffscreenDirection => {
  const [direction, setDirection] = useState<OffscreenDirection>(null);

  useEffect(() => {
    if (!scroller || !target) return undefined;

    // An IntersectionObserver reports once as soon as it starts observing, so
    // this also takes the first reading.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry || entry.isIntersecting) {
        setDirection(null);

        return;
      }

      const top = entry.rootBounds?.top ?? 0;
      setDirection(entry.boundingClientRect.top < top ? 'up' : 'down');
    }, { root: scroller, rootMargin: `${-topInset}px 0px 0px 0px` });

    observer.observe(target);

    return () => observer.disconnect();
  }, [scroller, target, topInset]);

  // Nothing to point at once either element is gone, whatever was last read.
  return scroller && target ? direction : null;
};

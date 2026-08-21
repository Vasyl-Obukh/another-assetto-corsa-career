import { useEffect, useState } from 'react';

import { SENTINEL_MARGIN } from './constants.ts';
import type { InfiniteScroll } from './types.ts';

export type { InfiniteScroll } from './types.ts';

/**
 * Calls back when a sentinel at the end of a scrolling list comes into view.
 *
 * Both refs are state-backed rather than useRef, so the effect can depend on the
 * elements and rebuild the observer when either is replaced. The scrolling
 * element has to be the observer's root: with the default viewport root the
 * sentinel is clipped to nothing by the scrolling ancestor, and the margin that
 * loads the next page early never gets a chance to fire.
 * @param onReach Called each time the sentinel becomes visible
 * @param enabled False when there is nothing left to load
 * @returns The refs to attach to the scroller and the sentinel
 */
export const useInfiniteScroll = (onReach: () => void, enabled: boolean): InfiniteScroll => {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root || !sentinel || !enabled) return undefined;

    const observer = new IntersectionObserver(
      (entries) => { if (entries.some((entry) => entry.isIntersecting)) onReach(); },
      { root, rootMargin: SENTINEL_MARGIN },
    );
    observer.observe(sentinel);

    return () => { observer.disconnect(); };
  }, [root, sentinel, enabled, onReach]);

  return { scrollRef: setRoot, sentinelRef: setSentinel };
};

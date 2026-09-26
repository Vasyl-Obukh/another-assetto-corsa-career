import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';

import { BackToTop } from '@/components/BackToTop.tsx';
import { SCREEN_WIDTH, WIDE_SCREEN_WIDTH } from '@/lib/layout';

interface BrowserLayoutProps {
  /**
   * The page's own title, for the browser that is a page rather than a picker.
   */
  heading?: ReactNode;
  /**
   * The filter rail.
   */
  rail: ReactNode;
  /**
   * The search, sort and layout controls, and what is filtering the results.
   */
  toolbar: ReactNode;
  /**
   * The results.
   */
  children: ReactNode;
  /**
   * Ref for the results' scroller, which is what paging watches.
   * @param element The element, or null as it unmounts
   */
  scrollRef(element: HTMLDivElement | null): void;
  /**
   * Whether to float a way back to the top once the results have scrolled, for
   * the browser that is the page.
   */
  backToTop: boolean;
  /**
   * Whether the browser takes the whole window rather than the shared column,
   * for results that are a board and only gain from the room.
   */
  wide?: boolean;
}

/**
 * A content browser fitted to the height it is given: the rail and the results
 * each scroll inside themselves, so the filters and the search stay where they
 * are however far down the results go.
 */
export const BrowserLayout = ({
  heading, rail, toolbar, children, scrollRef, backToTop, wide = false,
}: BrowserLayoutProps) => {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  // Held here as well as handed on, since the back-to-top button watches it too.
  const attach = useCallback((element: HTMLDivElement | null): void => {
    setScroller(element);
    scrollRef(element);
  }, [scrollRef]);

  return (
    <div className={`${wide ? WIDE_SCREEN_WIDTH : SCREEN_WIDTH} flex h-full flex-col`}>
      {heading}

      <div className="grid min-h-0 flex-1 grid-cols-[15.5rem_minmax(0,1fr)] gap-6 pt-4 pb-6">
        {rail}

        <div className="flex min-h-0 min-w-0 flex-col">
          <div className="flex shrink-0 flex-col gap-2 pb-3">{toolbar}</div>
          {/* Padded out past the column's edges, so a card's glow on hover is
              not cut off by the scroller; the gutter keeps the width steady. */}
          <div ref={attach} className="-mx-3 min-h-0 flex-1 overflow-y-auto px-3 pt-1 [scrollbar-gutter:stable]">
            {children}
          </div>
        </div>
      </div>

      {backToTop ? <BackToTop target={scroller} wide={wide} /> : null}
    </div>
  );
};

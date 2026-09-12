import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';

import { BackToTop } from './BackToTop.tsx';
import { SCREEN_WIDTH } from '@/lib/layout';
import { cn } from '@/lib/utils';

interface ScreenBodyProps {
  /**
   * Everything the screen puts inside the column.
   */
  children: ReactNode;
  /**
   * Layout for the column itself - its gap, its vertical padding, and whether
   * it is a flex column at all. The width and the horizontal padding are not
   * negotiable, which is the point of this component.
   */
  className?: string;
  /**
   * Called with the scrolling element, for a screen that has to read or
   * restore its own scroll position.
   * @param element The element, or null once it unmounts
   */
  scrollRef?: (element: HTMLDivElement | null) => void;
  /**
   * Whether to offer a button back to the top once the page has scrolled a
   * long way. For a long page with no pinned header of its own.
   */
  backToTop?: boolean;
}

export const ScreenBody = ({
  children, className, scrollRef, backToTop = false,
}: ScreenBodyProps) => {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);

  // Held here as well as handed on, since the back-to-top button watches the
  // same element a screen may have asked for.
  const attach = useCallback((element: HTMLDivElement | null): void => {
    setScroller(element);
    scrollRef?.(element);
  }, [scrollRef]);

  return (
    // The gutter is reserved whether or not the page scrolls, so the column -
    // and the Back link at its top - sits in the same place on a short page
    // as on a long one, and does not jump once content loads.
    <div ref={attach} className="h-full overflow-y-auto [scrollbar-gutter:stable]">
      <div className={cn(SCREEN_WIDTH, className)}>
        {children}
      </div>

      {backToTop ? <BackToTop target={scroller} /> : null}
    </div>
  );
};

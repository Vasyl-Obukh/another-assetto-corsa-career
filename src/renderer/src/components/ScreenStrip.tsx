import type { ReactNode } from 'react';

import { SCREEN_WIDTH } from '@/lib/layout';
import { cn } from '@/lib/utils';

interface ScreenStripProps {
  /**
   * What sits in the strip.
   */
  children: ReactNode;
  /**
   * Layout for the column itself - its gap and vertical padding. The width and
   * the horizontal padding are `ScreenBody`'s, which is the point.
   */
  className?: string;
}

/**
 * The content column, above a scroller rather than inside one - for chrome that
 * stays put while the `ScreenBody` below it scrolls.
 *
 * Reserves the same scrollbar gutter `ScreenBody` does, or the strip would sit
 * half a scrollbar to the right of the column under it.
 */
export const ScreenStrip = ({ children, className }: ScreenStripProps) => (
  <div className="overflow-y-hidden [scrollbar-gutter:stable]">
    <div className={cn(SCREEN_WIDTH, className)}>
      {children}
    </div>
  </div>
);

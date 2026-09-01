import type { ReactNode, Ref } from 'react';

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
   * The scrolling element, for a screen that has to read or restore its own
   * scroll position.
   */
  scrollRef?: Ref<HTMLDivElement>;
}

export const ScreenBody = ({ children, className, scrollRef }: ScreenBodyProps) => (
  <div ref={scrollRef} className="h-full overflow-y-auto">
    <div className={cn(SCREEN_WIDTH, className)}>
      {children}
    </div>
  </div>
);

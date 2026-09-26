import type { ReactNode } from 'react';

import { cn } from '@/lib/utils.ts';

interface SubHeadingProps {
  /**
   * The heading's text.
   */
  children: ReactNode;
  /**
   * Extra classes, for the space above a heading that is not the first.
   */
  className?: string;
}

/**
 * A small capitalised heading over one group of a settings section.
 */
export const SubHeading = ({ children, className }: SubHeadingProps) => (
  <h3 className={cn('mb-2 text-[11.5px] font-semibold tracking-wider text-muted-foreground uppercase', className)}>
    {children}
  </h3>
);

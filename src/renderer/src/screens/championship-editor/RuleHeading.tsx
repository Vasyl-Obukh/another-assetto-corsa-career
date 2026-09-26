import type { ReactNode } from 'react';

import { cn } from '@/lib/utils.ts';

interface RuleHeadingProps {
  /**
   * Classes for the heading, such as space above it.
   */
  className?: string;
  /**
   * The heading, already translated, and anything set beside it.
   */
  children: ReactNode;
}

/**
 * A heading between the parts of a form, in small capitals with a rule running
 * on from it to the edge.
 */
export const RuleHeading = ({ className, children }: RuleHeadingProps) => (
  <div className={cn('flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase after:flex-1 after:border-t', className)}>
    {children}
  </div>
);

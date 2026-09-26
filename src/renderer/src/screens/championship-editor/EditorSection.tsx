import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';

interface EditorSectionProps {
  /**
   * The already-translated heading.
   */
  title: string;
  /**
   * An already-translated line beside it, for what the heading cannot carry.
   */
  hint?: string;
  /**
   * An already-translated count, shown at the end of the heading.
   */
  summary?: string;
  /**
   * Classes for the content, which owns its own layout.
   */
  className?: string;
  /**
   * The section's controls.
   */
  children: ReactNode;
}

/**
 * One card of a tab, headed the same way as every other: the heading, a quiet
 * line beside it, and a count at the far end.
 */
export const EditorSection = ({
  title, hint, summary, className, children,
}: EditorSectionProps) => (
  <Card className="gap-3 px-4 py-4 sm:px-5">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 className="text-base font-semibold">{title}</h2>
      {hint === undefined ? null : <p className="min-w-0 flex-1 text-sm text-muted-foreground">{hint}</p>}
      {/* Neutral on purpose: a count, not one of a closed set. */}
      {summary === undefined ? null : (
        <Badge variant="outline" className="ml-auto shrink-0 font-normal">{summary}</Badge>
      )}
    </div>

    <div className={cn('min-w-0', className)}>{children}</div>
  </Card>
);

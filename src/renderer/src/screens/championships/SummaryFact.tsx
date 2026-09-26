import type { ReactNode } from 'react';

interface SummaryFactProps {
  /**
   * What the fact is, already translated.
   */
  label: string;
  /**
   * Its value.
   */
  children: ReactNode;
}

// One line of a championship's summary: the label on the left, its value
// pushed to the right edge.
export const SummaryFact = ({ label, children }: SummaryFactProps) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 text-right">{children}</span>
  </div>
);

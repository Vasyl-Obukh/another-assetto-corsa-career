import type { ReactNode } from 'react';

interface ContinueLineProps {
  /**
   * What stands beside it: the driver's flag, or the mode's own mark.
   */
  mark: ReactNode;
  /**
   * The first line - who, or how many.
   */
  title: string;
  /**
   * The second line - where it stands.
   */
  detail: string;
}

/**
 * What a start screen tile's main button carries on with, in a muted strip on
 * the card.
 */
export const ContinueLine = ({ mark, title, detail }: ContinueLineProps) => (
  <div className="flex items-center gap-2.5 rounded-lg bg-muted px-3 py-2.5">
    {mark}
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-sm font-semibold">{title}</span>
      <span className="truncate text-xs text-muted-foreground">{detail}</span>
    </div>
  </div>
);

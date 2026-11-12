import type { ReactNode } from 'react';

import { cn } from '@/lib/utils.ts';

interface MailTileProps {
  /**
   * What the figure is.
   */
  label: string;
  /**
   * The figure itself.
   */
  children: ReactNode;
  /**
   * The line under it.
   */
  detail?: ReactNode;
  /**
   * Classes for the figure's own line.
   */
  className?: string;
}

// One figure of a row of them under a mail - a place, the points, a fine - its
// label above and a line under it. The row is a grid the caller lays out, its
// tiles divided by the grid's own rules.
export const MailTile = ({
  label, children, detail, className,
}: MailTileProps) => (
  <div className="flex min-w-0 flex-col gap-1 px-3.5 py-2.5">
    <dt className="truncate text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt>
    <dd className={cn('flex items-center gap-1.5 font-semibold', className)}>{children}</dd>
    {detail ? <dd className="text-xs text-muted-foreground">{detail}</dd> : null}
  </div>
);

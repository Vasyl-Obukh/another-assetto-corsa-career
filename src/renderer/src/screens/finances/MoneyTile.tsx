import type { ReactNode } from 'react';

import { TILE_LEAD } from './constants.ts';
import type { TileLead } from './types.ts';
import { cn } from '@/lib/utils.ts';

interface MoneyTileProps {
  /**
   * What it measures.
   */
  label: string;
  /**
   * The figure.
   */
  value: ReactNode;
  /**
   * A line saying more.
   */
  hint: ReactNode;
  /**
   * Which page's row it heads, when it is the first of the row.
   */
  lead?: TileLead;
  /**
   * Anything under the hint.
   */
  children?: ReactNode;
}

/**
 * One figure along the top of Finances, Contracts, Sponsors or Rating.
 */
export const MoneyTile = ({
  label, value, hint, lead, children,
}: MoneyTileProps) => {
  const accent = lead ? TILE_LEAD[lead] : null;

  return (
    <div className={cn('flex flex-col gap-1 rounded-xl border bg-card px-4 py-3', accent?.tile)}>
      <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {accent ? (
          <span className={cn('-my-0.5 grid size-5 place-items-center rounded-md', accent.well)}>
            <accent.icon className="size-3" />
          </span>
        ) : null}
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className="truncate text-xs text-muted-foreground">{hint}</span>
      {children}
    </div>
  );
};

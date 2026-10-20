import type { ReactNode } from 'react';

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
  hint: string;
  /**
   * Whether it is the balance, which heads the row.
   */
  lead?: boolean;
}

/**
 * One figure along the top of Finances.
 */
export const MoneyTile = ({
  label, value, hint, lead = false,
}: MoneyTileProps) => (
  <div className={cn('flex flex-col gap-1 rounded-xl border bg-card px-4 py-3', lead && 'border-t-4 border-t-success')}>
    <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
    <span className="text-2xl font-semibold tabular-nums">{value}</span>
    <span className="truncate text-xs text-muted-foreground">{hint}</span>
  </div>
);

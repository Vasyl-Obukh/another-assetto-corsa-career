import type { LucideIcon } from 'lucide-react';

import { STAT_TILE } from './constants.ts';

interface StatTileProps {
  /**
   * The icon beside its label.
   */
  icon: LucideIcon;
  /**
   * What is counted.
   */
  label: string;
  /**
   * The count, already formatted.
   */
  value: string;
  /**
   * A line under the count putting it in context.
   */
  sub?: string;
}

/**
 * One count of what a scan found.
 */
export const StatTile = ({
  icon: Icon, label, value, sub,
}: StatTileProps) => (
  <div className={STAT_TILE}>
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5" />
      {label}
    </span>
    <span className="text-2xl leading-tight font-semibold tabular-nums">{value}</span>
    {sub ? <span className="text-xs text-muted-foreground">{sub}</span> : null}
  </div>
);

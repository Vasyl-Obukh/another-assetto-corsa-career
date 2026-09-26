import type { StripFigure } from './types.ts';
import { cn } from '@/lib/utils.ts';

interface ResultStripProps {
  /**
   * The figures, left to right.
   */
  figures: readonly StripFigure[];
  /**
   * Extra classes.
   */
  className?: string;
}

/**
 * What the player did, as a row of large figures: where they finished, how
 * they got there, what it paid. The same strip a session result, a round's
 * summary and a result page open with.
 */
export const ResultStrip = ({ figures, className }: ResultStripProps) => (
  <section
    className={cn('grid auto-cols-fr grid-flow-col overflow-hidden rounded-xl border bg-card shadow-sm', className)}
  >
    {figures.map((figure) => (
      <div key={figure.label} className="flex min-w-0 flex-col gap-1 border-l px-4 py-3 first:border-l-0">
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {figure.label}
        </span>
        <span className="flex min-w-0 items-center gap-2 text-xl font-semibold tabular-nums">
          {figure.value}
          {figure.detail ? (
            <span className="truncate text-xs font-medium text-muted-foreground">{figure.detail}</span>
          ) : null}
        </span>
      </div>
    ))}
  </section>
);

import { SPARKLINE } from './constants.ts';
import { cn } from '@/lib/utils.ts';

interface SparklineProps {
  /**
   * The positions to draw, first at the top.
   */
  positions: readonly number[];
  /**
   * How many drivers the table holds, which is the bottom of the line.
   */
  field: number;
  /**
   * Whether the line is still being drawn - an edition under way - which draws
   * it quieter than a finished one.
   */
  running?: boolean;
  /**
   * Extra classes.
   */
  className?: string;
}

/**
 * A championship position after each round as one small line, the top of the
 * table at the top - so a season's shape reads beside its final place.
 */
export const Sparkline = ({
  positions, field, running = false, className,
}: SparklineProps) => {
  const { width, height, inset } = SPARKLINE;
  const bottom = Math.max(field, 2);
  const step = positions.length > 1 ? (width - 2 * inset) / (positions.length - 1) : 0;
  const x = (at: number): number => inset + at * step;
  const y = (position: number): number => inset + ((position - 1) * (height - 2 * inset)) / (bottom - 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('block h-6 w-full', className)}
      aria-hidden
    >
      {positions.length > 1 ? (
        <polyline
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          className={running ? 'stroke-muted-foreground' : 'stroke-primary'}
          points={positions.map((position, at) => `${x(at)},${y(position)}`).join(' ')}
        />
      ) : null}
    </svg>
  );
};

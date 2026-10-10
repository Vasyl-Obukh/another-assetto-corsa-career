import { useTranslation } from 'react-i18next';

import { resultAccent } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface ResultCellProps {
  /**
   * Where the car finished, counting from one.
   */
  position: number;
  /**
   * Whether the finish scored, which is what turns a place off the podium
   * green. A podium place wears its metal whether it scored or not.
   */
  scored: boolean;
  /**
   * Whether it started from pole, marked with a dot in qualifying's colour.
   */
  pole?: boolean;
  /**
   * Whether it set the fastest lap, marked with a dot in primary.
   */
  fastestLap?: boolean;
  /**
   * Written as "P3" rather than "3", where the cell stands alone rather than in
   * a column headed by what it is.
   */
  prefixed?: boolean;
  /**
   * Drawn without its colour, for a place that pays nothing by being one - a
   * practice or qualifying order beside the races of an event.
   */
  quiet?: boolean;
  /**
   * How large to draw it.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Extra classes.
   */
  className?: string;
}

const SIZE = {
  sm: 'h-5 min-w-6 px-1 text-[0.7rem]',
  md: 'h-6 min-w-7.5 px-1.5 text-xs',
  lg: 'h-7.5 min-w-10 px-2 text-[0.95rem]',
} as const;

/**
 * One finish in one race, the same everywhere a finish is listed: the podium in
 * its metals, a points finish green, and the rest plain - so a P3 reads the same
 * on the standings grid, the round table and an event's list.
 */
export const ResultCell = ({
  position, scored, pole = false, fastestLap = false, prefixed = false, quiet = false, size = 'md', className,
}: ResultCellProps) => {
  const { t } = useTranslation();
  const accent = quiet ? 'font-medium text-muted-foreground' : resultAccent(position, scored) ?? 'font-medium';

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center rounded-md font-semibold tabular-nums',
        SIZE[size],
        accent,
        className,
      )}
    >
      {pole ? (
        <i
          aria-label={t('standings.legend.pole')}
          className="absolute top-0.5 left-0.5 size-1.5 rounded-full bg-session-qualify-foreground"
        />
      ) : null}
      {prefixed ? t('championships.detail.position', { number: position }) : position}
      {fastestLap ? (
        <i
          aria-label={t('standings.legend.fastestLap')}
          className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary"
        />
      ) : null}
    </span>
  );
};

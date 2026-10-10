import { useTranslation } from 'react-i18next';

import { PositionChart } from './PositionChart.tsx';
import type { Championship } from '../../../../shared/types';
import { ResultCell } from '@/components';
import type { RoundStanding } from '@/lib/season-review';

interface RoundPathCardProps {
  /**
   * The championship, as the season holds it, for its rounds' names.
   */
  series: Championship;
  /**
   * Where the player stood after each round, and what they took from it.
   */
  path: readonly RoundStanding[];
  /**
   * How many drivers the class's table holds.
   */
  field: number;
}

/**
 * The player's season round by round: where they stood after each, and each
 * round's own results and points beneath it.
 */
export const RoundPathCard = ({ series, path, field }: RoundPathCardProps) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col rounded-xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4">
        <h2 className="font-semibold">{t('review.path')}</h2>
        <span className="text-xs text-muted-foreground">{t('review.pathHint')}</span>
      </header>
      <div className="px-4 pt-2">
        <PositionChart path={path} field={field} />
      </div>
      <ol
        className="grid gap-1.5 px-4 pt-1 pb-4"
        style={{ gridTemplateColumns: `repeat(${Math.max(path.length, 1)}, minmax(0, 1fr))` }}
      >
        {path.map((one) => (
          <li key={one.round} className="flex min-h-18 min-w-0 flex-col items-center gap-1 rounded-lg bg-muted/50 px-1 py-1.5">
            <span className="w-full truncate text-center text-[0.7rem] font-semibold">
              {series.rounds.find((round) => round.id === one.round)?.name ?? one.round}
            </span>
            <span className="flex flex-wrap justify-center gap-0.5">
              {one.places.map((place, at) => (
                <ResultCell
                  // The round's races in the order they ran; nothing else tells
                  // two of the player's own places apart.
                  // eslint-disable-next-line react/no-array-index-key
                  key={at}
                  position={place.classPosition}
                  scored={place.points > 0}
                  pole={place.qualifyingPosition === 1}
                  fastestLap={place.fastestLap}
                  size="sm"
                />
              ))}
            </span>
            {one.points > 0 ? (
              <span className="text-xs font-semibold text-result-points-foreground tabular-nums">
                {t('review.earned', { points: one.points })}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
};

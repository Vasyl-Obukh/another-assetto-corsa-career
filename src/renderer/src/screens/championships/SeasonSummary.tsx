import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Championship } from '../../../../shared/types';
import { Movement, ResultCell, StandingsTable } from '@/components';
import { useFormat } from '@/i18n';
import type { ClassSeason } from '@/lib/season-results';

interface SeasonSummaryProps {
  /**
   * The player's class, or the first class of a championship the career is
   * not in.
   */
  season: ClassSeason;
  /**
   * The championship.
   */
  series: Championship;
  /**
   * How many rounds the tables count.
   */
  counted: number;
  /**
   * What the player is called.
   */
  playerName: string;
  /**
   * Called to open the full standings.
   */
  onFull: () => void;
}

/**
 * The sidebar's standings: where the player stands and how they got there,
 * then the top of the table with them in it. A championship the career is not
 * in shows only the table, since nobody in it is the player.
 */
export const SeasonSummary = ({
  season, series, counted, playerName, onFull,
}: SeasonSummaryProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const player = season.drivers.find((row) => row.player);
  const leader = season.drivers[0];

  return (
    <section className="flex flex-col rounded-xl border bg-card shadow-sm">
      <h2 className="px-4 pt-4 font-semibold">{t(player ? 'standings.season.title' : 'standings.title')}</h2>

      {counted === 0 ? (
        <p className="px-4 pt-2 pb-4 text-sm text-muted-foreground">{t('standings.noneYet')}</p>
      ) : (
        <>
          {player ? (
            <dl className="grid grid-cols-3 gap-2 px-4 pt-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {t('standings.season.position')}
                </dt>
                <dd className="flex items-center gap-1.5">
                  <ResultCell position={player.position} scored={player.points > 0} prefixed size="lg" />
                  <Movement move={player.move} />
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {t('standings.season.points')}
                </dt>
                <dd className="flex items-baseline gap-1.5 text-xl font-semibold tabular-nums">
                  {formatNumber(player.points)}
                  <span className="text-xs font-medium text-muted-foreground">
                    {player.position === 1
                      ? t('standings.season.leading')
                      : t('standings.season.behind', { points: formatNumber((leader?.points ?? 0) - player.points) })}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {t('standings.season.wins')}
                </dt>
                <dd className="flex items-baseline gap-1.5 text-xl font-semibold tabular-nums">
                  {formatNumber(player.wins)}
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('standings.season.podiums', { count: player.podiums })}
                  </span>
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="px-1 pt-3 pb-1">
            <StandingsTable season={season} series={series} playerName={playerName} compact />
          </div>
          <button
            type="button"
            onClick={onFull}
            className="flex items-center justify-center gap-1 border-t py-2 text-xs font-medium text-primary hover:bg-accent/50"
          >
            {t('standings.fullStandings')}
            <ChevronRightIcon className="size-3.5" />
          </button>
        </>
      )}
    </section>
  );
};

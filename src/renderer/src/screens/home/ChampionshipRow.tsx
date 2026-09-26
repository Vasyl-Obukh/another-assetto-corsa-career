import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ROUND_MARK } from './constants.ts';
import type { SeasonProgress } from './types.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_DOT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { tierAccent } from '@/screens/championships';

interface ChampionshipRowProps {
  /**
   * The championship and how far through it the player is.
   */
  progress: SeasonProgress;
}

export const ChampionshipRow = ({ progress }: ChampionshipRowProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();

  return (
    <Link
      to={path.championship({ id: progress.series })}
      className="grid grid-cols-[0.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
    >
      <span
        aria-hidden
        className={cn('self-stretch rounded-full', progress.ladder ? DISCIPLINE_DOT[progress.ladder.discipline] : 'bg-muted')}
      />

      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold">{progress.name}</span>
          {progress.ladder ? (
            <Badge className={cn('shrink-0', tierAccent(progress.ladder.tier))}>
              {t('championships.tier', { tier: progress.ladder.tier })}
            </Badge>
          ) : null}
          {progress.className ? (
            <span className="truncate text-xs text-muted-foreground">{progress.className}</span>
          ) : null}
        </span>

        {/* A segment per round, so how far through the season you are - and
            what you let slip - reads without counting. */}
        <span className="flex gap-0.5" aria-hidden>
          {progress.marks.map((mark, at) => (
            // Segments are positional, a round each in order, and say nothing
            // that tells one apart from its place.
            // eslint-disable-next-line react/no-array-index-key
            <span key={at} className={cn('h-1.5 flex-1 rounded-full', ROUND_MARK[mark])} />
          ))}
        </span>

        <span className="text-xs text-muted-foreground">
          {progress.next
            ? t('home.nextRound', {
              number: progress.marks.indexOf('next') + 1,
              day: formatDayShort(progress.next.firstDay),
            })
            : t('home.seasonDone')}
        </span>
      </span>

      <span className="flex flex-col items-end">
        <span className="tabular-nums">
          <span className="text-lg font-semibold">
            {progress.position === null ? t('home.noPosition') : t('home.position', { position: progress.position })}
          </span>
          <span className="text-xs text-muted-foreground">{t('home.ofField', { count: progress.field })}</span>
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {t('home.points', { count: progress.points })}
        </span>
      </span>
    </Link>
  );
};

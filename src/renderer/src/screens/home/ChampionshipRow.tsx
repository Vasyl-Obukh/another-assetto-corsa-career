import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { SeasonProgress } from './types.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { disciplineDot, ROUND_MARK } from '@/lib/accents';
import { editionName } from '@/lib/edition-names';
import { linkRun, path } from '@/lib/routes';
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
      // A finished edition opens its review; one still running, its page.
      to={progress.over
        ? path.championshipReview({ series: progress.series, season: progress.season, edition: progress.edition })
        : path.championship(
          { id: progress.series },
          linkRun({ season: progress.season, edition: progress.edition }, progress.season, progress.editions),
        )}
      className="grid grid-cols-[0.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
    >
      <span
        aria-hidden
        className={cn('self-stretch rounded-full', disciplineDot(progress.ladder))}
      />

      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold">{progress.name}</span>
          {progress.ladder ? (
            <Badge className={cn('shrink-0', tierAccent(progress.ladder.tier))}>
              {t('championships.tier', { tier: progress.ladder.tier })}
            </Badge>
          ) : null}
          {/* Neutral on purpose: an edition's name is an identifier, not one of a set. */}
          {progress.editions > 1 ? (
            <Badge variant="secondary" className="shrink-0">
              {editionName({ year: progress.year, edition: progress.edition, editions: progress.editions }, t)}
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
              day: formatDayShort(progress.next.date),
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

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DOOR_ACCENT } from './constants.ts';
import { Door } from './Door.tsx';
import type { Career } from '../../../../shared/types';
import { ResultCell, Shimmer } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useLatestResults } from '@/hooks';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { archiveOrigins, resultEvents } from '@/lib/result-events';
import { path } from '@/lib/routes';
import { sessionName } from '@/lib/session-labels';

interface ResultsDoorProps {
  /**
   * The career, which says which round each archive was raced for.
   */
  career: Career;
}

/**
 * Home's way into Results, previewing the last event driven: where it was,
 * each session's place and what the event paid.
 */
export const ResultsDoor = ({ career }: ResultsDoorProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const results = useLatestResults();
  // Main reads the newest event's archives alone, so this is one event.
  const latest = useMemo(
    () => resultEvents(results.records, archiveOrigins(career))[0],
    [results.records, career],
  );
  const round = latest?.origin
    ? latest.origin.entry.championship.rounds.find((one) => one.id === latest.origin?.round)
    : undefined;
  const points = latest?.sessions.reduce((sum, one) => sum + (one.place?.points ?? 0), 0) ?? 0;

  return (
    <Door
      to={path.results()}
      accent={DOOR_ACCENT.results}
      icon="results"
      title={t('home.doors.results.title')}
      hint={results.loading
        ? <Shimmer className="h-3 w-48" />
        : [t('home.doors.results.hint'), t('home.doors.results.sessions', { count: results.sessions })].join(' · ')}
      kicker={t('home.doors.results.latest')}
    >
      {results.loading ? (
        <>
          <Shimmer className="my-1 h-3.5 w-60" />
          <div className="flex gap-1.5">
            <Shimmer className="h-5.5 w-20" />
            <Shimmer className="h-5.5 w-7" />
            <Shimmer className="h-5.5 w-14" />
            <Shimmer className="h-5.5 w-7" />
          </div>
        </>
      ) : null}
      {!results.loading && !latest ? <p className="text-sm text-muted-foreground">{t('home.doors.results.none')}</p> : null}
      {latest ? (
        <>
          <p className="flex min-w-0 items-baseline gap-2 text-sm">
            <span className="truncate font-semibold">{latest.origin?.entry.championship.name ?? latest.title}</span>
            {round ? <span className="truncate text-xs text-muted-foreground">{round.name}</span> : null}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {latest.sessions.map((one) => (
              <span key={one.record.file} className="flex items-center gap-1">
                <Badge className={SESSION_ACCENT[one.type]}>{sessionName(one, t)}</Badge>
                {one.player ? (
                  <ResultCell
                    position={one.place?.classPosition ?? one.player.position}
                    scored={(one.place?.finishPoints ?? 0) > 0}
                    quiet={one.type !== 'race'}
                    prefixed
                    size="sm"
                  />
                ) : null}
              </span>
            ))}
            {points > 0 ? (
              <span className="ml-auto text-xs font-semibold text-result-points-foreground tabular-nums">
                {t('review.earned', { points: formatNumber(points) })}
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </Door>
  );
};

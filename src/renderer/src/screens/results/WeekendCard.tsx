import { ChevronRightIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { SESSION_SCROLL } from './constants.ts';
import { WeekendCardHead } from './WeekendCardHead.tsx';
import { formatLapTime } from '../../../../shared/utils/lap-time';
import { entryResults } from '../../../../shared/utils/standings';
import {
  BonusPoints, CarSwatch, Movement, ResultCell,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { formatDayRange, useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import type { ResultWeekend } from '@/lib/result-weekends';
import { path } from '@/lib/routes';
import { seasonResults } from '@/lib/season-results';
import { sessionName } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';

interface WeekendCardProps {
  /**
   * The weekend.
   */
  weekend: ResultWeekend;
}

/**
 * One weekend of the Results page: the track, the championship and round, the
 * car, and every session driven there with where the player finished and what
 * it paid - each opening its own result. A championship round ends in what it
 * did to the championship, which opens the round's page.
 */
export const WeekendCard = ({ weekend }: WeekendCardProps) => {
  const { t } = useTranslation();
  const { formatDay, formatNumber } = useFormat();

  const { origin, sessions } = weekend;
  const championship = origin?.entry.championship;
  const round = championship?.rounds.find((one) => one.id === origin?.round);
  const number = round && championship ? championship.rounds.indexOf(round) + 1 : null;
  const record = sessions.at(-1)?.record;
  const layout = round
    ? { id: round.track.id, layout: round.track.layout ?? '' }
    : record?.layout ?? null;
  const own = sessions.find((one) => one.player)?.player ?? null;
  const carName = useCarNames(own ? [own.car] : []);

  // Where the round left the championship, once it is a round of the career's.
  const after = useMemo(() => {
    if (!origin) return null;
    const season = seasonResults(entryResults(origin.entry), origin.round);
    const table = season.classes.find((one) => one.entry === origin.entry.entry);

    return table?.drivers.find((row) => row.player) ?? null;
  }, [origin]);
  const earned = sessions.reduce((sum, one) => sum + (one.place?.points ?? 0), 0);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <WeekendCardHead
        layout={layout}
        pill={formatDayRange(t, formatDay, weekend.from.slice(0, 10), weekend.to.slice(0, 10))}
        title={championship?.name ?? weekend.title}
        line={round && number
          ? t('championships.detail.roundAt', { number, round: round.name })
          : record?.layout?.name ?? record?.summary.track}
      />

      {own ? (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-muted-foreground">
          <CarSwatch model={own.car} skin={own.skin} />
          <span className="truncate">{carName(own.car)}</span>
          <span className="ml-auto shrink-0">
            {t('calendar.grid', { count: sessions.at(-1)?.session.standings.length ?? 0 })}
          </span>
        </div>
      ) : null}

      <div className={cn('mx-2 mb-2 flex flex-col', SESSION_SCROLL)}>
        {sessions.map((one) => (
          <Link
            key={one.record.file}
            to={path.result({ file: one.record.file })}
            className="grid h-9 shrink-0 grid-cols-[7rem_minmax(0,1fr)_auto_2.75rem] items-center gap-3 rounded-md border-t px-2 first:border-t-0 hover:bg-accent/50"
          >
            <Badge className={`justify-self-start ${SESSION_ACCENT[one.type]}`}>
              {sessionName(one, t)}
            </Badge>
            <span className="text-sm text-muted-foreground tabular-nums">{formatLapTime(one.player?.bestLap ?? null)}</span>
            <span className="text-xs font-semibold text-result-points-foreground tabular-nums">
              {one.place && one.place.points > 0 ? (
                <>
                  {t('standings.bonus.plus', { points: formatNumber(one.place.finishPoints) })}
                  <BonusPoints qualifying={one.place.qualifyingPoints} fastestLap={one.place.fastestLapPoints} />
                </>
              ) : null}
            </span>
            {one.player ? (
              <ResultCell
                className="justify-self-end"
                position={one.place?.classPosition ?? one.player.position}
                scored={(one.place?.finishPoints ?? 0) > 0}
                quiet={one.type !== 'race'}
                prefixed
              />
            ) : <span />}
          </Link>
        ))}
      </div>

      {origin && after ? (
        <Link
          to={path.event({ series: origin.entry.series, round: origin.round })}
          className="mt-auto flex items-center gap-2 border-t px-4 py-2.5 text-xs hover:bg-accent/50"
        >
          <span className="flex items-center gap-1">
            {t('event.summary.title')}
            <b className="text-result-points-foreground tabular-nums">
              {t('standings.bonus.plus', { points: formatNumber(earned) })}
            </b>
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <ResultCell position={after.position} scored={after.points > 0} prefixed size="sm" />
            <Movement move={after.move} />
          </span>
          <ChevronRightIcon className="ml-auto size-3.5 text-primary" />
        </Link>
      ) : null}
    </article>
  );
};

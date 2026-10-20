import { CheckIcon, InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ALL_CLASSES, RESULT_SKELETON } from './constants.ts';
import { ResultTableSkeleton } from './ResultTableSkeleton.tsx';
import { shareOf, shortLaps } from './utils.ts';
import { DRIVER_STRENGTH_SPREAD } from '../../../../shared/constants';
import type {
  CareerEventView, Championship, EventSession, LaunchRecord,
} from '../../../../shared/types';
import { aiFigure } from '../../../../shared/utils/ai-figure';
import { formatGap, formatLapTime } from '../../../../shared/utils/lap-time';
import { prizeSpeed } from '../../../../shared/utils/prizes';
import { useSlot } from '@/app';
import {
  BonusPoints, ClassificationTable, ErrorCard, Podium, ResultCell, ResultStrip, Segments,
} from '@/components';
import type { StripFigure } from '@/components';
import { useResult } from '@/hooks';
import { usePlayerName } from '@/hooks';
import { useFormat } from '@/i18n';
import { classAccent } from '@/lib/accents';
import { classifiedRows, racedClasses } from '@/lib/classification';
import { prizeFor } from '@/lib/season-review';

interface SessionResultProps {
  /**
   * The event: its grid, and whether the player raced it - a round of the
   * career, or a race event of the player's own.
   */
  view: Pick<CareerEventView, 'grid' | 'substituted' | 'status'> & Partial<Pick<CareerEventView, 'historic'>>;
  /**
   * The session, which has run.
   */
  session: EventSession;
  /**
   * What running it left.
   */
  record: LaunchRecord;
  /**
   * The championship the round belongs to, for flags and teams.
   */
  series?: Championship | null;
}

/**
 * A session that has run: what the player did, the podium of a race, and the
 * whole classification - read off the archive for a session that was driven,
 * and off the order the career recorded for one that was simulated.
 */
export const SessionResult = ({
  view, session, record, series = null,
}: SessionResultProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const speed = prizeSpeed(useSlot().career);
  const simulated = record.skipped === true;
  // A simulated session archived nothing, so there is no file to ask for.
  const detail = useResult(simulated ? null : record.archive);

  const [shown, setShown] = useState<string>(ALL_CLASSES);

  const race = session.type === 'race';
  const summary = simulated ? null : detail.record?.summary.sessions.at(-1) ?? null;
  const source = {
    type: session.type,
    standings: summary?.standings ?? null,
    record,
    grid: view.grid,
    score: session.score,
    startOrder: session.startOrder,
    series,
    substituted: view.substituted,
  };
  const rows = classifiedRows(source);
  const playerName = usePlayerName();
  const mine = rows.find((row) => row.player);
  const classes = racedClasses(rows, series?.entries ?? []);
  const multi = classes.length > 1;
  const listed = multi && shown !== ALL_CLASSES ? classifiedRows({ ...source, entry: shown }) : rows;
  // The player measures against their own class: its fastest lap and its
  // podium, in a race where several classes run at once.
  const own = multi && mine?.entry ? classifiedRows({ ...source, entry: mine.entry }) : rows;
  const ownRow = own.find((row) => row.player);
  const ownClass = classes.find((one) => one.id === mine?.entry);
  const fastest = Math.min(...own.map((row) => row.bestLap ?? Infinity));
  const strength = mine?.entry ? record.classStrength?.[mine.entry] : undefined;
  const pays = rows.some((row) => (row.place?.points ?? 0) > 0);
  /**
   * Places made up from the grid, in words.
   * @param gained Places gained, negative for places lost
   * @returns What the strip says beside the starting slot
   */
  const gainedText = (gained: number): string => {
    if (gained === 0) return t('results.strip.held');

    return gained > 0
      ? t('results.strip.gained', { count: gained })
      : t('results.strip.lost', { count: -gained });
  };

  const figures: StripFigure[] = mine ? [
    {
      label: t('event.result.you'),
      value: (
        <ResultCell
          position={ownRow?.position ?? mine.position}
          scored={(mine.place?.finishPoints ?? 0) > 0}
          prefixed
          size="lg"
        />
      ),
      detail: multi && ownClass
        ? t('results.strip.inClass', { name: ownClass.name, position: mine.position, count: rows.length })
        : t('results.strip.of', { count: rows.length }),
    },
    ...(race && mine.started !== null ? [{
      label: t('results.strip.started'),
      value: t('championships.detail.position', { number: mine.started }),
      detail: gainedText(mine.started - mine.position),
    }] : []),
    ...(mine.bestLap !== null ? [{
      label: t('event.result.best'),
      value: formatLapTime(mine.bestLap),
      detail: mine.bestLap === fastest
        ? t('results.strip.fastest')
        : t('results.strip.toFastest', { gap: formatGap(mine.bestLap - fastest) }),
    }] : []),
    ...(mine.place && pays ? [{
      label: t('event.result.points'),
      value: (
        <span className="text-result-points-foreground">
          {t('standings.bonus.plus', { points: formatNumber(mine.place.points) })}
        </span>
      ),
      detail: mine.place.points > 0 && mine.place.points !== mine.place.finishPoints ? (
        <>
          {formatNumber(mine.place.finishPoints)}
          <BonusPoints qualifying={mine.place.qualifyingPoints} fastestLap={mine.place.fastestLapPoints} />
        </>
      ) : null,
    }] : []),
    // How long the race ran, off the launch's own record, so a later race at
    // full length never reads as shortened. Plain, as the AI figure beside it.
    ...(record.scale !== undefined && session.laps !== undefined ? [{
      label: t('event.brief.length'),
      value: shortLaps(session.laps, record.scale, t),
      detail: shareOf(session.laps, record.scale, t, formatNumber),
    }] : []),
    // What the launch recorded, so a step taken since never rewrites it.
    ...(strength !== undefined ? [{
      label: t('results.strip.strength'),
      value: formatNumber(strength),
      detail: multi ? (
        // The dots between the classes are drawn, so no literal sits in the markup.
        <span className="flex flex-wrap gap-x-1.5 [&>span+span]:before:mr-1.5 [&>span+span]:before:content-['·']">
          {classes.flatMap((one) => {
            const figure = record.classStrength?.[one.id];

            return one.id === mine.entry || figure === undefined ? [] : [(
              <span key={one.id}>{t('results.strip.classStrength', { name: one.name, figure: formatNumber(figure) })}</span>
            )];
          })}
        </span>
      ) : t('race.ai.drivers', {
        low: formatNumber(aiFigure(strength, -DRIVER_STRENGTH_SPREAD)),
        high: formatNumber(aiFigure(strength, DRIVER_STRENGTH_SPREAD)),
      }),
    }] : []),
  ] : [];

  // A knockout segment the player was out of has nothing archived: it could
  // not be launched at all, so its order was simulated from the one before.
  const footnote = simulated
    ? (
      <>
        <InfoIcon className="size-3.5" />
        {view.status === 'missed' ? t('event.result.simulatedRound') : t('event.result.simulated')}
      </>
    )
    : (
      <>
        <CheckIcon className="size-3.5 text-success" />
        {summary?.order === 'raceResult' ? t('results.order.raceResultHint') : t('results.order.inferredHint')}
      </>
    );

  return (
    <div className="flex flex-col gap-4">
      {figures.length > 0 ? <ResultStrip figures={figures} /> : null}

      {detail.error && !simulated ? <ErrorCard error={detail.error} onDismiss={detail.dismissError} /> : null}
      {/* A race's recorded order is there before its archive, so its rows,
          classes and points are known while the laps load. */}
      {detail.loading && !simulated ? (
        <ResultTableSkeleton
          strip={!mine}
          race={race}
          rows={rows.length > 0 ? rows.length : RESULT_SKELETON}
          points={pays}
          classes={multi}
        />
      ) : null}

      {race && own.length >= 3 && (simulated || summary) ? <Podium rows={own} playerName={playerName} /> : null}

      {multi && (simulated || summary) ? (
        <Segments
          label={t('results.classFilter')}
          items={[
            { id: ALL_CLASSES, label: t('results.overall'), count: rows.length },
            ...classes.map((one, at) => ({
              id: one.id,
              label: one.name,
              icon: <span className={`size-2.5 rounded-full ${classAccent(at).mark}`} aria-hidden />,
              count: rows.filter((row) => row.entry === one.id).length,
            })),
          ]}
          value={shown}
          onChange={setShown}
        />
      ) : null}

      {(simulated || summary) && listed.length > 0 ? (
        <div className="overflow-hidden rounded-xl border">
          <ClassificationTable
            rows={listed}
            race={race}
            playerName={playerName}
            footnote={footnote}
            classes={classes}
            // A historic event pays money and no points, so its places say
            // what they were worth.
            prizeOf={view.historic && series ? (row) => (
              row.place && !row.place.bonusOnly
                ? prizeFor(series, row.place.entry, row.place.classPosition, speed)
                : null
            ) : undefined}
          />
        </div>
      ) : null}
    </div>
  );
};

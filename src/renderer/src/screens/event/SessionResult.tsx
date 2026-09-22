import { useTranslation } from 'react-i18next';

import { playerPosition } from './utils.ts';
import type { EventSession, LaunchRecord } from '../../../../shared/types';
import { formatLapTime } from '../../../../shared/utils/lap-time';
import { ErrorCard } from '@/components';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useResult } from '@/hooks';
import { useFormat } from '@/i18n';
import { SessionTable } from '@/screens/results';

interface SessionResultProps {
  /**
   * The session, which has run.
   */
  session: EventSession;
  /**
   * What running it left.
   */
  record: LaunchRecord;
}

/**
 * A session that has run: where the player finished and what it paid, then the
 * whole classification off its archived result.
 */
export const SessionResult = ({ session, record }: SessionResultProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const detail = useResult(record.archive);

  // A knockout segment the player was out of has nothing archived: it could
  // not be launched at all, so its order was simulated from the one before.
  if (record.skipped) {
    return <p className="text-sm text-muted-foreground">{t('event.result.simulated')}</p>;
  }

  const position = playerPosition(record);
  const summary = detail.record?.summary.sessions.at(-1);
  const best = position === null ? null : summary?.standings[position - 1]?.bestLap ?? null;

  return (
    <div className="flex flex-col gap-3">
      <dl className="flex flex-wrap gap-x-8 gap-y-2">
        <div className="flex flex-col">
          <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('event.result.you')}
          </dt>
          <dd className="text-lg font-semibold">
            {position === null ? '-' : t('event.position', { position })}
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('event.result.best')}
          </dt>
          <dd className="text-lg font-semibold tabular-nums">{formatLapTime(best)}</dd>
        </div>
        {session.place ? (
          <div className="flex flex-col">
            <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t('event.result.points')}
            </dt>
            <dd className="text-lg font-semibold tabular-nums">{formatNumber(session.place.points)}</dd>
          </div>
        ) : null}
      </dl>

      {detail.error ? <ErrorCard error={detail.error} onDismiss={detail.dismissError} /> : null}
      {detail.loading ? <Skeleton className="h-48 w-full" /> : null}
      {summary ? (
        <SessionTable
          session={summary}
          points={session.points.length > 0 ? session.points : undefined}
          highlight={position ?? undefined}
        />
      ) : null}
    </div>
  );
};

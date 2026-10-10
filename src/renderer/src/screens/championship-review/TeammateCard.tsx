import { useTranslation } from 'react-i18next';

import type { Championship } from '../../../../shared/types';
import { DriverName } from '@/components';
import { useFormat } from '@/i18n';
import type { DriverRow } from '@/lib/season-results';
import { seatNation } from '@/lib/season-results';
import type { TeammateRecord } from '@/lib/season-review';

interface TeammateCardProps {
  /**
   * The championship, for the two drivers' flags.
   */
  series: Championship;
  /**
   * The player's row of the final table.
   */
  me: DriverRow;
  /**
   * How the two fared against each other.
   */
  record: TeammateRecord;
  /**
   * What the player is called, over the name the championship gave their seat.
   */
  playerName: string;
}

/**
 * The player against the other seat of their team: who started ahead, who
 * finished ahead, and who scored more - each a bar split between the two.
 */
export const TeammateCard = ({
  series, me, record, playerName,
}: TeammateCardProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const rows = [
    { label: t('review.qualifyingAhead'), mine: record.qualifying.ahead, theirs: record.qualifying.behind },
    { label: t('review.finishAhead'), mine: record.finish.ahead, theirs: record.finish.behind },
    { label: t('review.teammatePoints'), mine: me.points, theirs: record.row.points },
  ];

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <h2 className="font-semibold">{t('review.teammate')}</h2>
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <DriverName name={playerName} nation={seatNation(series, me.seat)} player />
        <DriverName name={record.row.driver} nation={seatNation(series, record.row.seat)} className="justify-end" />
      </div>
      <dl className="flex flex-col gap-2">
        {rows.map(({ label, mine, theirs }) => (
          <div key={label} className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-x-2.5 gap-y-1">
            <dt className="col-span-3 text-center text-xs text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{formatNumber(mine)}</dd>
            {/* The player's share in primary, the teammate's in a quiet grey: the
                two are told apart by side and by which is the player's colour. */}
            <dd className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
              <span className="bg-primary" style={{ width: `${(100 * mine) / Math.max(mine + theirs, 1)}%` }} />
              <span className="bg-muted-foreground/50" style={{ width: `${(100 * theirs) / Math.max(mine + theirs, 1)}%` }} />
            </dd>
            <dd className="text-right font-semibold tabular-nums">{formatNumber(theirs)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

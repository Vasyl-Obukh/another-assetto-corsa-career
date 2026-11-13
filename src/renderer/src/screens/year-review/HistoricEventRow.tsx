import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ResultCell } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { disciplineWell, EVENT_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import type { HistoricRow } from '@/lib/season-review';
import { cn } from '@/lib/utils.ts';
import { LayoutMap } from '@/screens/track-browser';

interface HistoricEventRowProps {
  /**
   * The historic event.
   */
  row: HistoricRow;
  /**
   * Which season it falls in, counting from zero, which its link names.
   */
  season: number;
  /**
   * The season the career is in, so the link names a run only when it differs.
   */
  current: number;
}

// One historic event of a season, a row of its table: when, what and where,
// the car the player was invited into, and what came of it.
export const HistoricEventRow = ({ row, season, current }: HistoricEventRowProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatMoney } = useFormat();
  const carName = useCarNames(row.car ? [row.car] : []);

  return (
    <tr className="border-t">
      <td className="py-2 pr-3 pl-4 whitespace-nowrap tabular-nums">{formatDayShort(row.date)}</td>
      <td className="py-2 pr-3">
        <Link
          to={path.event({ series: row.series, round: row.round }, season === current ? undefined : { season })}
          className="flex items-center gap-3 hover:underline"
        >
          {/* The well wears the discipline the event is raced in. */}
          <span className={cn('relative block aspect-[16/10] w-12 shrink-0 overflow-hidden rounded', disciplineWell(row.ladder))}>
            <LayoutMap track={row.track} alt={row.name} className="p-0.5" />
          </span>
          <span className="font-medium">{row.name}</span>
        </Link>
      </td>
      <td className="py-2 pr-3 text-muted-foreground">
        {[
          row.car ? carName(row.car) : t(`home.historic.${row.outcome === 'open' ? 'open' : 'notEntered'}`),
          row.team,
        ].filter((part) => part).join(' · ')}
      </td>
      <td className="py-2 pr-3 tabular-nums">
        {row.qualified === null
          ? <span className="text-muted-foreground">{t('standings.none')}</span>
          : t('championships.detail.position', { number: row.qualified })}
      </td>
      <td className="py-2 pr-3">
        {row.finished === null ? null : (
          <span className="flex items-center gap-1.5">
            <ResultCell position={row.finished} scored={false} prefixed size="sm" />
            {/* Said only where a class place could be taken for an overall one. */}
            {row.multiClass
              ? <span className="text-xs text-muted-foreground">{t('yearReview.historic.inClass')}</span>
              : null}
          </span>
        )}
        {row.outcome === 'missed' ? (
          <Badge className={EVENT_ACCENT.missed}>{t(`home.historic.${row.outcome}`)}</Badge>
        ) : null}
        {row.outcome === 'scheduled' ? (
          <span className="text-muted-foreground">{t('calendar.status.scheduled')}</span>
        ) : null}
      </td>
      <td className="py-2 pr-4 text-right tabular-nums">
        {row.prize === null
          ? <span className="text-muted-foreground">{t('standings.none')}</span>
          : formatMoney(row.prize)}
      </td>
    </tr>
  );
};

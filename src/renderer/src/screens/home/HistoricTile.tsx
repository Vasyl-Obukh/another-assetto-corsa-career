import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { disciplineDot, EVENT_ACCENT, resultAccent } from '@/lib/accents';
import { path } from '@/lib/routes';
import type { HistoricRow } from '@/lib/season-review';
import { cn } from '@/lib/utils.ts';

interface HistoricTileProps {
  /**
   * The historic event.
   */
  row: HistoricRow;
  /**
   * Whether it is the next event of the season's historic events still to run.
   */
  next: boolean;
}

// One historic event of the season as a small card: when, what, in which car,
// and what came of it. Opens its page.
export const HistoricTile = ({ row, next }: HistoricTileProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const carName = useCarNames([row.car]);
  const past = row.outcome !== 'scheduled';

  return (
    <Link
      to={path.event({ series: row.series, round: row.round })}
      className={cn(
        'relative flex min-w-0 flex-col gap-1 overflow-hidden rounded-lg border py-2.5 pr-3 pl-4 hover-outline',
        past ? 'bg-transparent' : 'bg-card',
      )}
    >
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', disciplineDot(row.ladder))} />
      <span className="text-xs text-muted-foreground tabular-nums">{formatDayShort(row.date)}</span>
      <span className="truncate text-sm font-semibold">{row.name}</span>
      <span className="truncate text-xs text-muted-foreground">{carName(row.car)}</span>
      <span className="flex flex-wrap items-center gap-1 pt-0.5">
        {row.outcome === 'raced' ? (
          <>
            <Badge className={cn('px-1.5 py-0 text-[0.65rem]', EVENT_ACCENT.raced)}>{t('calendar.status.raced')}</Badge>
            {row.finished === null ? null : (
              <Badge
                variant="outline"
                className={cn('px-1.5 py-0 text-[0.65rem]', resultAccent(row.finished, false))}
              >
                {t('home.position', { position: row.finished })}
              </Badge>
            )}
          </>
        ) : null}
        {row.outcome === 'declined' || row.outcome === 'missed' ? (
          <Badge className={cn('px-1.5 py-0 text-[0.65rem]', EVENT_ACCENT.missed)}>
            {t(`home.historic.${row.outcome}`)}
          </Badge>
        ) : null}
        {next ? (
          <span className="text-[0.65rem] font-bold tracking-wide text-primary uppercase">{t('home.mark.next')}</span>
        ) : null}
      </span>
    </Link>
  );
};

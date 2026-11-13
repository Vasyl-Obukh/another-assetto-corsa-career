import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { DISCIPLINE_TEXT } from './constants.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { DISCIPLINE_DOT, EVENT_ACCENT, resultAccent } from '@/lib/accents';
import { path } from '@/lib/routes';
import type { HistoricRow } from '@/lib/season-review';
import { cn } from '@/lib/utils.ts';
import { disciplineKey } from '@/screens/championships';

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
  const carName = useCarNames(row.car ? [row.car] : []);
  const past = row.outcome !== 'scheduled' && row.outcome !== 'open';

  return (
    <Link
      to={path.event({ series: row.series, round: row.round })}
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-lg border px-3 py-2.5 hover-outline',
        past ? 'bg-transparent' : 'bg-card',
      )}
    >
      {/* Nothing else on the tile names the discipline, so it leads, in its colour. */}
      <span className="flex min-w-0 items-center gap-1.5 text-xs">
        {row.ladder ? (
          <>
            <span aria-hidden className={cn('size-2 shrink-0 rounded-full', DISCIPLINE_DOT[row.ladder.discipline])} />
            <span className={cn('truncate font-semibold', DISCIPLINE_TEXT[row.ladder.discipline])}>
              {t(disciplineKey(row.ladder.discipline))}
            </span>
          </>
        ) : null}
        <span className={cn('shrink-0 text-muted-foreground tabular-nums', row.ladder && "before:mr-1.5 before:content-['·']")}>
          {formatDayShort(row.date)}
        </span>
      </span>
      <span className="truncate text-sm font-semibold">{row.name}</span>
      <span className="truncate text-xs text-muted-foreground">
        {row.car ? carName(row.car) : t(`home.historic.${row.outcome === 'open' ? 'open' : 'notEntered'}`)}
      </span>
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
        {row.outcome === 'missed' ? (
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

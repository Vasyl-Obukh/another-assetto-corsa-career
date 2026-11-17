import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { SKIP_ACCENT } from './constants.ts';
import type { SkippedRound } from '../../../../shared/types';
import { HistoricChip } from '../HistoricChip.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { disciplineDot, LEDGER_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface SkipRowProps {
  /**
   * The round.
   */
  round: SkippedRound;
  /**
   * Whether to name its championship too, for a row with no championship
   * heading above it.
   */
  named: boolean;
}

export const SkipRow = ({ round, named }: SkipRowProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatMoney } = useFormat();
  const title = t('skip.round', { number: round.number, name: round.roundName });

  return (
    <li className="grid grid-cols-[0.25rem_minmax(0,1fr)_auto] items-center gap-3 border-t py-2 pr-3 first:border-t-0">
      <span
        aria-hidden
        className={cn('self-stretch', disciplineDot(round.ladder))}
      />
      <span className="flex min-w-0 flex-col">
        {/* A historic event is one event: its chip stands where a round says
            which round it is, and its name only where no heading gives it. */}
        {round.historic ? (
          <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
            <HistoricChip className="shrink-0 px-1.5 py-0 text-[0.65rem]" />
            {named ? <span className="truncate">{round.seriesName}</span> : null}
          </span>
        ) : (
          <span className="truncate text-sm font-medium">
            {named ? t('skip.named', { series: round.seriesName, round: title }) : title}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDayShort(round.date)}
        </span>
      </span>
      <span className="flex items-center gap-2">
        {/* An invitation can still be answered before the move is made. */}
        {round.reason === 'unanswered' ? (
          <Link
            to={path.event({ series: round.series, round: round.round })}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t('skip.answer')}
          </Link>
        ) : null}
        {/* What its contract fines it, in the fine's own red. */}
        {round.fine ? (
          <Badge className={LEDGER_ACCENT.fine}>{t('skip.fine', { amount: formatMoney(round.fine) })}</Badge>
        ) : null}
        <Badge className={SKIP_ACCENT[round.reason]}>
          {round.block && round.block.kind !== 'other'
            ? t(`skip.block.${round.block.kind}`)
            : t(`skip.reason.${round.reason}`)}
        </Badge>
      </span>
    </li>
  );
};

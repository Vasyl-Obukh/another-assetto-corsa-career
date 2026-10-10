import { useTranslation } from 'react-i18next';

import { SKIP_ACCENT } from './constants.ts';
import type { SkippedRound } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { disciplineDot } from '@/lib/accents';
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
  const { formatDayShort } = useFormat();
  const title = t('skip.round', { number: round.number, name: round.roundName });

  return (
    <li className="grid grid-cols-[0.25rem_minmax(0,1fr)_auto] items-center gap-3 border-t py-2 pr-3 first:border-t-0">
      <span
        aria-hidden
        className={cn('self-stretch', disciplineDot(round.ladder))}
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">
          {named ? t('skip.named', { series: round.seriesName, round: title }) : title}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDayShort(round.date)}
        </span>
      </span>
      <Badge className={SKIP_ACCENT[round.reason]}>{t(`skip.reason.${round.reason}`)}</Badge>
    </li>
  );
};

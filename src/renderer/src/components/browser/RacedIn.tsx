import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT, DISCIPLINE_DOT } from '@/lib/accents';
import type { Racing } from '@/lib/racing-index';
import { cn } from '@/lib/utils.ts';

interface RacedInProps {
  /**
   * Where it races, or undefined when nothing does.
   */
  racing: Racing | undefined;
  /**
   * Whether it is a table cell, which has room for the count and a dot per
   * discipline rather than their names.
   */
  compact?: boolean;
}

/**
 * Which championships race a car or a circuit, as a count and the disciplines
 * they enter it at - what makes a library entry part of a career.
 */
export const RacedIn = ({ racing, compact = false }: RacedInProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  if (racing === undefined) {
    return compact
      ? <span className="text-muted-foreground">{t('common.dash')}</span>
      : <span className="text-xs text-muted-foreground">{t('browse.racedNone')}</span>;
  }

  const count = t('browse.racedIn', { count: racing.championships, shown: formatNumber(racing.championships) });

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1" title={count}>
        {racing.disciplines.map((discipline) => (
          <i
            key={discipline}
            aria-hidden
            title={t(`championships.discipline.${discipline}`)}
            className={cn('size-2 rounded-full', DISCIPLINE_DOT[discipline])}
          />
        ))}
        <span className="ml-1 font-semibold tabular-nums">{formatNumber(racing.championships)}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <TrophyIcon className="size-3.5" />
      <span className="mr-1">{count}</span>
      {racing.disciplines.map((discipline) => (
        <Badge key={discipline} className={cn(DISCIPLINE_ACCENT[discipline], 'px-1.5 text-[11px]')}>
          {t(`championships.discipline.${discipline}`)}
        </Badge>
      ))}
    </div>
  );
};

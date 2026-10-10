import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { NextRound } from './types.ts';
import { daysBetween } from '../../../../shared/utils/calendar-days';
import { Button } from '@/components/ui/button.tsx';
import { useCareer } from '@/hooks';
import { useFormat } from '@/i18n';

interface NextRoundBoxProps {
  /**
   * The round the page points at next.
   */
  next: NextRound;
  /**
   * Called to open its page.
   */
  onOpen: () => void;
}

/**
 * Which round is next and when, above the one button that opens it - so the
 * button says where it goes before it is pressed.
 */
export const NextRoundBox = ({ next, onOpen }: NextRoundBoxProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const today = useCareer().calendar?.date;
  const days = today === undefined ? 0 : daysBetween(today, next.date);

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-primary/40 bg-primary/5 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
          {t(next.underway ? 'championships.detail.underWay' : 'championships.detail.nextRound')}
        </span>
        {days > 0 ? (
          <span className="text-xs text-muted-foreground">{t('championships.detail.inDays', { count: days })}</span>
        ) : null}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">
          {t('championships.detail.roundAt', { number: next.number, round: next.round.name })}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDayShort(next.date)}
        </span>
      </div>
      <Button onClick={onOpen}>
        {t('championships.detail.openRound', { number: next.number, round: next.round.name })}
        <ArrowRightIcon />
      </Button>
    </div>
  );
};

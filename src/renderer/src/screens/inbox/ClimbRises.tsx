import { useTranslation } from 'react-i18next';

import type { SponsorRise } from '../../../../shared/types';
import { useFormat } from '@/i18n';

interface ClimbRisesProps {
  /**
   * What each figure pays now and paid before.
   */
  rises: readonly SponsorRise[];
}

// A deal's figures after it climbed, each beside what it paid.
export const ClimbRises = ({ rises }: ClimbRisesProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] overflow-hidden rounded-lg border text-sm">
      {rises.map((rise) => (
        <span key={rise.kind} className="contents">
          <span className="border-b bg-muted/30 px-3 py-2 text-xs text-muted-foreground last-of-type:border-b-0">{t(`inbox.sponsorNews.climbed.${rise.kind as 'racePay' | 'win' | 'podium' | 'points' | 'pole' | 'goalBonus'}`)}</span>
          <span className="flex items-baseline gap-2 border-b px-3 py-2 font-medium tabular-nums">
            {formatMoney(rise.amount)}
            <span className="text-xs font-normal text-muted-foreground line-through">{formatMoney(rise.was)}</span>
          </span>
        </span>
      ))}
    </div>
  );
};

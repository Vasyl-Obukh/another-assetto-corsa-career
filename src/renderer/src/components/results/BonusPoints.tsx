import { useTranslation } from 'react-i18next';

import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface BonusPointsProps {
  /**
   * Points taken for qualifying.
   */
  qualifying: number;
  /**
   * Points taken for the fastest lap.
   */
  fastestLap: number;
  /**
   * Extra classes for each figure.
   */
  className?: string;
}

/**
 * What qualifying and the fastest lap added on top of a finish, as small raised
 * figures beside it - qualifying in its session's violet, the fastest lap in
 * primary, the colours of the pole and fastest-lap dots. Nothing at all when
 * neither paid.
 */
export const BonusPoints = ({ qualifying, fastestLap, className }: BonusPointsProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <>
      {qualifying > 0 ? (
        <sup
          title={t('standings.bonus.qualifying', { points: formatNumber(qualifying) })}
          className={cn('ml-px text-[0.6rem] font-bold text-session-qualify-foreground', className)}
        >
          {t('standings.bonus.plus', { points: formatNumber(qualifying) })}
        </sup>
      ) : null}
      {fastestLap > 0 ? (
        <sup
          title={t('standings.bonus.fastestLap', { points: formatNumber(fastestLap) })}
          className={cn('ml-px text-[0.6rem] font-bold text-primary', className)}
        >
          {t('standings.bonus.plus', { points: formatNumber(fastestLap) })}
        </sup>
      ) : null}
    </>
  );
};

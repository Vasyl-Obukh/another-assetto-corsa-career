import { useTranslation } from 'react-i18next';

import { TierMedal } from './TierMedal.tsx';
import { disciplineKey } from './utils.ts';
import type { Career, Discipline } from '../../../../shared/types';
import {
  bestDiscipline, openLevels, ratingFloor, rungWidth,
} from '../../../../shared/utils/career-eligibility';
import { useFormat } from '@/i18n';

interface LadderRowHeadProps {
  /**
   * The career.
   */
  career: Career;
  /**
   * The discipline its row is.
   */
  discipline: Discipline;
}

/**
 * Where the career stands in one discipline, under its row's name: the rung
 * open to it and its rating, and how far to the next floor - or that the rung
 * is open through its best discipline rather than its own rating.
 */
export const LadderRowHead = ({ career, discipline }: LadderRowHeadProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const own = career.level[discipline];
  const open = openLevels(career.level)[discipline];
  const rating = career.rating[discipline];
  const through = bestDiscipline(career.level);
  const reach = Math.max(4, Math.min(100, ((rating - ratingFloor(own)) / rungWidth(own)) * 100));

  return (
    <div className="mt-1.5 flex flex-col gap-1 text-xs font-normal">
      <span className="flex items-center gap-1.5">
        <TierMedal tier={open} className="size-4.5 text-[10px]" />
        {t('championships.tier', { tier: open })}
        <span className="font-semibold tabular-nums">{formatNumber(rating)}</span>
      </span>
      {open < own ? (
        <span className="opacity-75">{t('championships.ladder.through', { discipline: t(disciplineKey(through)) })}</span>
      ) : null}
      {open >= own && own > 1 ? (
        <>
          <span className="h-1 w-full overflow-hidden rounded-full bg-card/60">
            <span className="block h-full rounded-full bg-current opacity-60" style={{ width: `${reach}%` }} />
          </span>
          <span className="opacity-75">
            {t('championships.ladder.toNext', { rating: formatNumber(ratingFloor(own - 1) - rating), tier: own - 1 })}
          </span>
        </>
      ) : null}
    </div>
  );
};

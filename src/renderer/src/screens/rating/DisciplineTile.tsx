import { useTranslation } from 'react-i18next';

import { RungBar } from './RungBar.tsx';
import { openThrough } from './utils.ts';
import type { Career, Discipline } from '../../../../shared/types';
import {
  bestDiscipline, dropRating, openLevels, ratingFloor,
} from '../../../../shared/utils/career-eligibility';
import { RatingChange } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { hasRaced } from '@/lib/rating';
import { disciplineKey, TierMedal, tierMetalKey } from '@/screens/championships';

interface DisciplineTileProps {
  /**
   * The career.
   */
  career: Career;
  /**
   * The discipline it stands for.
   */
  discipline: Discipline;
  /**
   * What the discipline's rating has moved since the season shown opened.
   */
  change: number;
}

/**
 * One discipline's rating: the figure, the rung open to it, where the rating
 * stands on its own rung, and what moves it on - the next floor, or the lift
 * entering a rung open through the career's best would give it.
 */
export const DisciplineTile = ({ career, discipline, change }: DisciplineTileProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const rating = career.rating[discipline];
  const own = career.level[discipline];
  const open = openLevels(career.level)[discipline];
  const through = openThrough(career, discipline);
  const drop = dropRating(own);

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <Badge className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
        <TierMedal tier={open} className="ml-auto size-6 text-xs" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{formatNumber(rating)}</span>
        {hasRaced(career.ratingLog, discipline) ? (
          <span className="text-xs text-muted-foreground">
            <RatingChange change={change} className="text-xs" />
            {' '}
            {t('rating.thisSeason')}
          </span>
        ) : <span className="text-xs text-muted-foreground">{t('rating.neverRaced')}</span>}
      </div>
      <RungBar rating={rating} tier={own} />
      <p className="text-xs text-muted-foreground">
        {through ? (
          <>
            <span className="font-medium text-foreground">
              {t('rating.tile.through', { tier: open, discipline: t(disciplineKey(bestDiscipline(career.level))) })}
            </span>
            {' '}
            {t('rating.tile.lift', { own, tier: open, floor: formatNumber(ratingFloor(open)) })}
          </>
        ) : null}
        {!through && own > 1 ? (
          <>
            <span className="font-medium text-foreground">
              {t('rating.tile.toNext', {
                rating: formatNumber(ratingFloor(own - 1) - rating), metal: t(tierMetalKey(own - 1)),
              })}
            </span>
            {' '}
            {t('rating.tile.opens', { tier: own - 1 })}
            {drop === null ? null : (
              <>
                {' '}
                {t('rating.tile.drops', { metal: t(tierMetalKey(own + 1)), under: formatNumber(drop) })}
              </>
            )}
          </>
        ) : null}
        {!through && own === 1 ? (
          <>
            <span className="font-medium text-foreground">{t('rating.tile.top')}</span>
            {' '}
            {drop === null ? null : t('rating.tile.drops', { metal: t(tierMetalKey(2)), under: formatNumber(drop) })}
          </>
        ) : null}
      </p>
    </div>
  );
};

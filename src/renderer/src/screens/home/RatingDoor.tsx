import { useTranslation } from 'react-i18next';

import { DOOR_ACCENT } from './constants.ts';
import { Door } from './Door.tsx';
import { DISCIPLINES } from '../../../../shared/constants';
import type { Career } from '../../../../shared/types';
import { openLevels } from '../../../../shared/utils/career-eligibility';
import { RatingChange } from '@/components';
import { useFormat } from '@/i18n';
import { DISCIPLINE_STROKE } from '@/lib/accents';
import { seasonOpening } from '@/lib/rating';
import { path } from '@/lib/routes';
import { disciplineKey, TierMedal } from '@/screens/championships';

interface RatingDoorProps {
  /**
   * The career.
   */
  career: Career;
}

/**
 * Home's way into Rating, previewing the global rating, what this season has
 * moved it by, and the rung and rating of every discipline.
 */
export const RatingDoor = ({ career }: RatingDoorProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const season = career.seasons.at(-1)?.index ?? 0;
  const opened = seasonOpening(career, season);
  const open = openLevels(career.level);

  return (
    <Door
      to={path.rating()}
      accent={DOOR_ACCENT.rating}
      icon="rating"
      title={t('home.doors.rating.title')}
      hint={t('home.doors.rating.hint')}
      kicker={t('home.doors.rating.levels')}
    >
      <p className="flex items-baseline gap-2">
        <span className="text-xl font-semibold tabular-nums">{formatNumber(career.globalRating)}</span>
        <span className="text-xs text-muted-foreground">
          <RatingChange change={career.globalRating - opened.global} className="text-xs" />
          {' '}
          {t('rating.thisSeason')}
        </span>
      </p>
      {DISCIPLINES.map((discipline) => (
        <p key={discipline} className="flex min-w-0 items-center gap-2 text-sm">
          <span className="size-2 shrink-0 rounded-full" style={{ background: DISCIPLINE_STROKE[discipline] }} />
          <span className="truncate">{t(disciplineKey(discipline))}</span>
          <TierMedal tier={open[discipline]} className="ml-auto size-5 text-[0.65rem]" />
          <span className="w-12 text-right text-muted-foreground tabular-nums">{formatNumber(career.rating[discipline])}</span>
        </p>
      ))}
    </Door>
  );
};

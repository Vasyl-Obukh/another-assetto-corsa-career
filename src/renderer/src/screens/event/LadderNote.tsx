import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DISCIPLINES } from '../../../../shared/constants';
import type { Career, LadderPosition } from '../../../../shared/types';
import { bestDiscipline, openLevels, ratingFloor } from '../../../../shared/utils/career-eligibility';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { CAUTION_ACCENT, DISCIPLINE_ACCENT, RATING_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, TierMedal, tierMetalKey } from '@/screens/championships';

interface LadderNoteProps {
  /**
   * The career entering.
   */
  career: Career;
  /**
   * Where the class picked sits on the ladder.
   */
  ladder: LadderPosition;
}

/**
 * What the ladder says of the class picked, in the Enter panel: when it is
 * locked, every way to open it - its own discipline's floor, or the rung above
 * it anywhere - and when it is open only through the career's best
 * discipline, what entering it does to its own rating. Nothing for a class the
 * career has earned on its own.
 */
export const LadderNote = ({ career, ladder }: LadderNoteProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { discipline, tier } = ladder;
  const own = career.level[discipline];
  const open = openLevels(career.level)[discipline];
  const through = bestDiscipline(career.level);
  const best = career.level[through];
  const name = t(disciplineKey(discipline));
  const rating = career.rating[discipline];

  if (tier < open) {
    // The rung above in any other discipline opens this one too, and the
    // highest rating is where that is nearest.
    const nearest = DISCIPLINES.filter((one) => one !== discipline)
      .reduce((one, other) => (career.rating[other] > career.rating[one] ? other : one));

    return (
      <div className="flex flex-col gap-2 rounded-lg border border-warning bg-warning/15 p-2.5 text-xs">
        <Badge className={cn('gap-1 self-start', CAUTION_ACCENT)}>
          <LockIcon className="size-3" />
          {t('event.ladder.locked', { tier, discipline: name })}
        </Badge>
        <span className="text-muted-foreground">
          {open < own
            ? t('event.ladder.youThrough', {
              open, discipline: name, best, through: t(disciplineKey(through)),
            })
            : t('event.ladder.you', { open, discipline: name })}
        </span>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1.5">
          <Badge className={DISCIPLINE_ACCENT[discipline]}>{name}</Badge>
          <span>{t('event.ladder.of', { rating: formatNumber(rating), floor: formatNumber(ratingFloor(tier)) })}</span>
          <span className="font-semibold tabular-nums">
            {t('event.ladder.toGo', { rating: formatNumber(ratingFloor(tier) - rating) })}
          </span>
          {tier > 1 ? (
            <>
              <Badge className={DISCIPLINE_ACCENT[nearest]}>{t(disciplineKey(nearest))}</Badge>
              <span>
                {t('event.ladder.anywhere', {
                  tier: tier - 1,
                  rating: formatNumber(career.rating[nearest]),
                  floor: formatNumber(ratingFloor(tier - 1)),
                })}
              </span>
              <span className="font-semibold tabular-nums">
                {t('event.ladder.toGo', { rating: formatNumber(Math.max(0, ratingFloor(tier - 1) - career.rating[nearest])) })}
              </span>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  if (tier >= own) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/40 p-2.5 text-xs">
      <span className="flex items-center gap-2 font-semibold">
        {t('event.ladder.through', { discipline: t(disciplineKey(through)) })}
        <TierMedal tier={tier} className="ml-auto size-5 text-[0.65rem]" />
      </span>
      <span className="text-muted-foreground">
        {t('event.ladder.throughDetail', {
          discipline: name, own, through: t(disciplineKey(through)), best,
        })}
      </span>
      <span className="flex items-start gap-1.5">
        <Badge className={RATING_ACCENT.lift}>{t('rating.kind.lift')}</Badge>
        {t('event.ladder.lift', {
          discipline: name,
          from: formatNumber(rating),
          to: formatNumber(ratingFloor(tier)),
          metal: t(tierMetalKey(tier)),
        })}
      </span>
    </div>
  );
};

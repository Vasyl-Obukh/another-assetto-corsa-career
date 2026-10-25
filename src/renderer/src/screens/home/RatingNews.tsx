import { ChevronDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { DISCIPLINES } from '../../../../shared/constants';
import type { Career, RatingLine } from '../../../../shared/types';
import { ratingFloor } from '../../../../shared/utils/career-eligibility';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, TierMedal, tierMetalKey } from '@/screens/championships';

interface RatingNewsProps {
  /**
   * The career.
   */
  career: Career;
}

/**
 * Whether two lines came from the same round.
 * @param one A line
 * @param other Another
 * @returns True when they share their run and round
 */
const sameRound = (one: RatingLine, other: RatingLine): boolean => (
  one.season === other.season && one.series === other.series
  && one.edition === other.edition && one.round === other.round
);

/**
 * What the ladder just did for the career, said on Home: a rung gained in the
 * round last raced, in the discipline's own colour, or a rung lost as the
 * season opened, in the warning amber - each there until the next round is.
 */
export const RatingNews = ({ career }: RatingNewsProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const log = career.ratingLog;
  const last = log.findLast((line) => line.kind === 'race' || line.kind === 'qualifying');
  const season = career.seasons.at(-1)?.index ?? 0;
  const promoted = last ? log.filter((line) => line.kind === 'promotion' && line.discipline && sameRound(line, last)) : [];
  // Lost only as a season closes, so shown until the new one races anything.
  const dropped = last && last.season === season
    ? []
    : log.filter((line) => line.kind === 'drop' && line.discipline && line.season === season - 1);

  return (
    <>
      {promoted.map((line) => {
        const discipline = line.discipline ?? DISCIPLINES[0];
        const tier = line.tier ?? 1;

        return (
          <section
            key={line.key}
            className={cn('flex flex-wrap items-center gap-4 rounded-xl px-4 py-3 shadow-sm', DISCIPLINE_ACCENT[discipline])}
          >
            <TierMedal tier={tier} className="ring-2 ring-card" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-semibold">
                {t('home.rating.promoted', { tier, discipline: t(disciplineKey(discipline)) })}
              </span>
              <span className="text-sm opacity-85">
                {t('home.rating.promotedDetail', {
                  rating: formatNumber(line.rating ?? 0),
                  metal: t(tierMetalKey(tier)),
                  floor: formatNumber(ratingFloor(tier)),
                  discipline: t(disciplineKey(discipline)),
                })}
              </span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={path.championships()}>{t('home.rating.ladder')}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={path.rating()}>{t('home.rating.open')}</Link>
            </Button>
          </section>
        );
      })}
      {dropped.map((line) => {
        const discipline = line.discipline ?? DISCIPLINES[0];
        const tier = line.tier ?? 1;

        return (
          <section
            key={line.key}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-warning bg-warning/20 px-4 py-3 shadow-sm"
          >
            <ChevronDownIcon className="size-5 text-warning-foreground" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-semibold">
                {t('home.rating.dropped', { tier, discipline: t(disciplineKey(discipline)) })}
              </span>
              <span className="text-sm text-muted-foreground">
                {t('home.rating.droppedDetail', {
                  rating: formatNumber(line.rating ?? 0),
                  metal: t(tierMetalKey(tier)),
                  floor: formatNumber(ratingFloor(tier - 1)),
                })}
              </span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={path.rating()}>{t('home.rating.open')}</Link>
            </Button>
          </section>
        );
      })}
    </>
  );
};

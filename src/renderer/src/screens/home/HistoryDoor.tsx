import { TrophyIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DOOR_ACCENT } from './constants.ts';
import { Door } from './Door.tsx';
import type { Career } from '../../../../shared/types';
import { seasonYear } from '../../../../shared/utils/editions';
import { ResultCell } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { EDITION_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { yearReview } from '@/lib/season-review';

interface HistoryDoorProps {
  /**
   * The career.
   */
  career: Career;
}

/**
 * Home's way into History, previewing the career's latest seasons: whether
 * each is under way, its titles, and where each finished edition ended.
 */
export const HistoryDoor = ({ career }: HistoryDoorProps) => {
  const { t } = useTranslation();
  const years = useMemo(() => career.seasons.slice(-2).reverse().map((season) => ({
    season,
    open: season === career.seasons.at(-1),
    review: yearReview(season, career.date),
  })), [career]);

  return (
    <Door
      to={path.history()}
      accent={DOOR_ACCENT.history}
      icon="history"
      title={t('home.doors.history.title')}
      hint={t('home.doors.history.hint')}
      kicker={t('home.doors.history.seasons')}
    >
      {years.map(({ season, open, review }) => {
        const finished = review.editions.filter((one) => one.over && one.position !== null);
        const running = review.editions.length - review.editions.filter((one) => one.over).length;

        return (
          <div key={season.index} className="flex min-h-7 items-center gap-2.5 text-sm">
            <span className="w-11 font-semibold tabular-nums">{seasonYear(season)}</span>
            {open ? <Badge className={EDITION_ACCENT.running}>{t('history.underWay')}</Badge> : null}
            {review.totals.titles > 0 ? (
              <Badge className={EDITION_ACCENT.title}>
                <TrophyIcon />
                {t('home.doors.history.titles', { count: review.totals.titles })}
              </Badge>
            ) : null}
            {review.editions.length === 0 ? (
              <span className="text-muted-foreground">{t('home.doors.history.empty')}</span>
            ) : null}
            <span className="ml-auto flex items-center gap-1">
              {finished.map((one) => (
                <ResultCell
                  key={`${one.series}-${one.edition}-${one.entry}`}
                  position={one.position ?? 0}
                  scored={one.points > 0}
                  prefixed
                  size="sm"
                />
              ))}
              {open && running > 0 ? (
                <span className="text-xs text-muted-foreground">{t('home.doors.history.running', { count: running })}</span>
              ) : null}
            </span>
          </div>
        );
      })}
    </Door>
  );
};

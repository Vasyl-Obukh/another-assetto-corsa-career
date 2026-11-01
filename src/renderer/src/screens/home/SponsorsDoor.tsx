import { useTranslation } from 'react-i18next';

import { DOOR_ACCENT, DOOR_LINES } from './constants.ts';
import { Door } from './Door.tsx';
import type { Career } from '../../../../shared/types';
import { goalStanding, liveDeals } from '../../../../shared/utils/sponsors';
import { Badge } from '@/components/ui/badge.tsx';
import { KEEP_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';

interface SponsorsDoorProps {
  /**
   * The career.
   */
  career: Career;
}

/**
 * Home's way into Sponsors, previewing each sponsor backing the career and
 * whether its goal is on course.
 */
export const SponsorsDoor = ({ career }: SponsorsDoorProps) => {
  const { t } = useTranslation();
  const live = liveDeals(career).slice(0, DOOR_LINES);

  return (
    <Door
      to={path.sponsors()}
      accent={DOOR_ACCENT.sponsors}
      icon="sponsors"
      title={t('home.doors.sponsors.title')}
      hint={t('home.doors.sponsors.hint')}
      kicker={t('home.doors.sponsors.goals')}
    >
      {live.length === 0 ? <p className="text-sm text-muted-foreground">{t('home.doors.sponsors.none')}</p> : null}
      {live.map((deal) => {
        const on = goalStanding(career, deal).onCourse;
        const mark = on === true ? 'kept' : on === false ? 'short' : null;

        return (
          <p key={deal.id} className="flex min-w-0 items-center justify-between gap-3 text-sm">
            <span className="truncate text-muted-foreground">{deal.sponsor.name}</span>
            {mark
              ? <Badge className={KEEP_ACCENT[mark]}>{t(`championships.contract.mark.${mark}`)}</Badge>
              : <span className="shrink-0 text-xs text-muted-foreground">{t('sponsors.progress.none')}</span>}
          </p>
        );
      })}
    </Door>
  );
};

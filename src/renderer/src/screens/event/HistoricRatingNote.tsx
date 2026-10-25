import { MedalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Career, LadderPosition } from '../../../../shared/types';
import { fieldRating } from '../../../../shared/utils/career-eligibility';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { disciplineKey, TierMedal } from '@/screens/championships';

interface HistoricRatingNoteProps {
  /**
   * The career invited.
   */
  career: Career;
  /**
   * Where the seat's class sits on the ladder.
   */
  ladder: LadderPosition;
}

/**
 * Why a career is invited to a historic event and what it counts for: any
 * rung invites, and the race is rated as one on the player's own rung in its
 * discipline, so a guest seat three rungs up is a treat rather than a
 * shortcut.
 */
export const HistoricRatingNote = ({ career, ladder }: HistoricRatingNoteProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { discipline, tier } = ladder;
  // The rung the discipline earned, which is the one it is rated on.
  const own = career.level[discipline];
  const name = t(disciplineKey(discipline));
  const guest = tier < own;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/40 p-2.5 text-xs">
      <span className="flex items-center gap-1.5 font-semibold">
        {t(guest ? 'historic.rating.guest' : 'historic.rating.invited')}
        <Badge className={`ml-auto ${DISCIPLINE_ACCENT[discipline]}`}>{name}</Badge>
        <TierMedal tier={tier} className="size-5 text-[0.65rem]" />
      </span>
      <span className="text-muted-foreground">
        {guest
          ? t('historic.rating.guestDetail', { tier, count: own - tier, own, discipline: name })
          : t('historic.rating.invitedDetail', { tier, own, discipline: name })}
      </span>
      <span className="flex items-start gap-1.5">
        <MedalIcon className="mt-0.5 size-3.5 shrink-0 text-podium-gold-foreground" />
        {t('historic.rating.counts', {
          own, discipline: name, field: formatNumber(fieldRating(own)), event: formatNumber(fieldRating(tier)),
        })}
      </span>
    </div>
  );
};

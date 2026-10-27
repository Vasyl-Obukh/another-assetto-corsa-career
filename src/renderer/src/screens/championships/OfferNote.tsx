import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { INVITATION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface OfferNoteProps {
  /**
   * How many seat offers for the edition are still to be answered.
   */
  waiting: number;
  /**
   * The day its teams' offers go out, as an ISO date - or null once they have.
   */
  day: string | null;
}

// What entering on the player's own does to teams' offers, said in the Enter
// panel before it is pressed: turns down those waiting, or - while they have
// not gone out yet - means none will come, as an invitation's note says when
// it goes out.
export const OfferNote = ({ waiting, day }: OfferNoteProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();

  if (waiting > 0) {
    return <p className="text-xs text-muted-foreground">{t('championships.offers.declines', { count: waiting })}</p>;
  }
  if (!day) return null;

  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border bg-muted/40 p-2.5 text-xs">
      <Badge className={cn('px-1.5 py-0 text-[0.65rem]', INVITATION_ACCENT.pending)}>
        {t('championships.offers.before', { day: formatDayShort(day) })}
      </Badge>
      <span className="text-muted-foreground">{t('championships.offers.beforeHint')}</span>
    </div>
  );
};

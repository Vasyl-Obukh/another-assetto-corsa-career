import { useTranslation } from 'react-i18next';

import type { HistoricInvitation } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { INVITATION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, tierMetalKey } from '@/screens/championships';

interface InvitationNoteProps {
  /**
   * The historic event's invitation.
   */
  invitation: HistoricInvitation;
  /**
   * The event's day, which an invitation left unanswered lapsed on.
   */
  date: string;
}

// What the Enter panel of a historic event says of its invitation: when they
// go out and the player's chance of one, or why there is none to take - and so
// that entering means paying.
export const InvitationNote = ({ invitation, date }: InvitationNoteProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatNumber } = useFormat();
  const {
    state, chance, rung, discipline,
  } = invitation;
  if (state === 'awaiting' || state === 'accepted' || state === 'entered') return null;

  const day = formatDayShort(invitation.invitations);
  const at = rung !== null && discipline !== null
    ? { metal: t(tierMetalKey(rung)), discipline: t(disciplineKey(discipline)) }
    : null;

  let hint = t('invitation.uninvitedPlain');
  if (state === 'pending') hint = at ? t('invitation.pendingHint', at) : '';
  else if (state === 'uninvited' && at && chance !== null) {
    hint = t('invitation.uninvitedHint', { ...at, day, chance: formatNumber(chance) });
  } else if (state === 'closed') hint = t('invitation.closedHint', { day });
  else if (state === 'declined') {
    hint = t('invitation.declinedHint', {
      team: invitation.team ?? t('inbox.organisers'), day: formatDayShort(invitation.answered ?? ''),
    });
  } else if (state === 'lapsed') hint = t('invitation.lapsedHint', { day: formatDayShort(date) });

  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border bg-muted/40 p-2.5 text-xs">
      <Badge className={cn('px-1.5 py-0 text-[0.65rem]', INVITATION_ACCENT[state])}>
        {t(`invitation.state.${state}`, { day })}
      </Badge>
      {state === 'pending' && chance !== null ? (
        <div className="flex w-full flex-col gap-1">
          <span className="flex items-baseline justify-between gap-2">
            <span>{t('invitation.chance')}</span>
            <span className="font-semibold tabular-nums">{t('invitation.percent', { value: formatNumber(chance) })}</span>
          </span>
          {/* A bar in the leather, the event's own colour, filled to the chance. */}
          <span className="h-1.5 w-full overflow-hidden rounded-full bg-historic">
            <span className="block h-full rounded-full bg-historic-foreground" style={{ width: `${chance}%` }} />
          </span>
        </div>
      ) : null}
      {hint ? <span className="text-muted-foreground">{hint}</span> : null}
    </div>
  );
};

import {
  CheckIcon, ChevronRightIcon, ClockIcon, XIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Career } from '../../../../shared/types';
import { daysBetween } from '../../../../shared/utils/calendar-days';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { INVITATION_WELL } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

interface ReplyBarProps {
  /**
   * The career, whose clock says how long is left.
   */
  career: Career;
  /**
   * The mail.
   */
  item: InboxItem;
  /**
   * The page of the event it is about, or null when there is none to open.
   */
  event: string | null;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to accept it.
   */
  onAccept: () => void;
  /**
   * Called to decline it, which asks first.
   */
  onDecline: () => void;
}

/**
 * The icon each state's well holds.
 */
const ICONS = {
  awaiting: ClockIcon,
  accepted: CheckIcon,
  declined: XIcon,
  lapsed: ClockIcon,
} as const satisfies Record<keyof typeof INVITATION_WELL, LucideIcon>;

// The foot of an open mail, pinned under it: how it was answered, or how long
// is left to answer it and the two answers.
export const ReplyBar = ({
  career, item, event, busy, onAccept, onDecline,
}: ReplyBarProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const { status, mail } = item;
  if (!status) return null;

  const Icon = ICONS[status];
  const deadline = mail.deadline ?? '';
  const day = formatDayShort(deadline);
  const team = item.team?.name ?? t('inbox.organisers');
  const left = daysBetween(career.date, deadline);
  const ahead = deadline >= career.date;

  let title = t('inbox.reply.lapsed', { day });
  let hint = t('inbox.reply.lapsedHint');
  if (status === 'awaiting') {
    title = `${t('inbox.reply.awaiting', { day })} · ${left > 0 ? t('inbox.reply.left', { count: left }) : t('inbox.reply.today')}`;
    hint = t('inbox.reply.awaitingHint');
  } else if (status === 'accepted') {
    title = t('inbox.reply.accepted', { day: formatDayShort(mail.reply?.on ?? '') });
    hint = t('inbox.reply.acceptedHint');
  } else if (status === 'declined') {
    title = t('inbox.reply.declined', { day: formatDayShort(mail.reply?.on ?? '') });
    hint = ahead ? t('inbox.reply.declinedAhead') : t('inbox.reply.declinedPast', { team, day });
  }

  return (
    <div className={cn(
      'flex flex-wrap items-center gap-3 border-t bg-card px-5 py-3',
      status === 'awaiting' && 'border-t-mail-awaiting-foreground/30',
    )}
    >
      <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4', INVITATION_WELL[status])}>
        <Icon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
      {status === 'awaiting' ? (
        <span className="flex gap-2">
          <Button variant="outline" disabled={busy} onClick={onDecline}>{t('inbox.reply.decline')}</Button>
          <Button disabled={busy} onClick={onAccept}>
            <CheckIcon />
            {t('inbox.reply.accept')}
          </Button>
        </span>
      ) : null}
      {status !== 'awaiting' && event ? (
        <Button asChild variant="outline">
          <Link to={event}>
            {/* A seat given back with the event still ahead can be entered
                at the player's own cost, which is what its page offers. */}
            {t(status === 'declined' && ahead ? 'inbox.reply.enter' : 'inbox.reply.open')}
            <ChevronRightIcon />
          </Link>
        </Button>
      ) : null}
    </div>
  );
};

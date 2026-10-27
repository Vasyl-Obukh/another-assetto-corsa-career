import {
  CheckIcon, ChevronRightIcon, ClockIcon, XIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Career, SeatOffer } from '../../../../shared/types';
import { daysBetween } from '../../../../shared/utils/calendar-days';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { INVITATION_WELL } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

interface OfferReplyBarProps {
  /**
   * The career, whose clock says how long is left.
   */
  career: Career;
  /**
   * The mail.
   */
  item: InboxItem;
  /**
   * The offer signed, once the mail was accepted.
   */
  signed: SeatOffer | null;
  /**
   * The championship's page.
   */
  link: string;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to decline every offer the mail holds, which asks first.
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

// The foot of an edition's open seat offers, pinned under them: how they were
// answered, or how long is left and Decline - each offer's own Accept sits at
// the foot of its column.
export const OfferReplyBar = ({
  career, item, signed, link, busy, onDecline,
}: OfferReplyBarProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const { status, mail, offers } = item;
  const first = offers[0];
  if (!status || !first) return null;

  const Icon = ICONS[status];
  const deadline = mail.deadline ?? '';
  const left = daysBetween(career.date, deadline);
  const many = offers.length > 1;
  const named = { team: first.teamName, series: first.seriesName };

  let title = t('inbox.offer.reply.lapsed', { day: formatDayShort(deadline) });
  let hint = many ? t('inbox.offers.reply.lapsedHint', named) : t('inbox.offer.reply.lapsedHint', named);
  if (status === 'awaiting') {
    title = `${t('inbox.offer.reply.awaiting', { day: formatDayShort(deadline) })} · ${
      left > 0 ? t('inbox.reply.left', { count: left }) : t('inbox.reply.today')}`;
    hint = many ? t('inbox.offers.reply.awaitingHint') : t('inbox.offer.reply.awaitingHint');
  } else if (status === 'accepted') {
    const team = signed?.teamName ?? first.teamName;
    title = t('inbox.offers.reply.accepted', { team, day: formatDayShort(mail.reply?.on ?? '') });
    hint = t('inbox.offers.reply.acceptedHint', {
      series: first.seriesName, team, day: formatDayShort(signed?.opener ?? first.opener), count: offers.length - 1,
    });
  } else if (status === 'declined') {
    title = t('inbox.offer.reply.declined', { day: formatDayShort(mail.reply?.on ?? '') });
    hint = t('inbox.offer.reply.declinedHint', named);
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
        <Button variant="outline" disabled={busy} onClick={onDecline}>
          {many ? t('inbox.offers.reply.declineAll') : t('inbox.reply.decline')}
        </Button>
      ) : (
        <Button asChild variant="outline">
          <Link to={link}>
            {t('inbox.offer.reply.open')}
            <ChevronRightIcon />
          </Link>
        </Button>
      )}
    </div>
  );
};

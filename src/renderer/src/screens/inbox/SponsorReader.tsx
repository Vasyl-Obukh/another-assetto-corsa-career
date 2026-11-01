import {
  CheckIcon, ClockIcon, MailIcon, MoreVerticalIcon, SparklesIcon, XIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { SponsorCompare } from './SponsorCompare.tsx';
import type { Career, SponsorOffer } from '../../../../shared/types';
import { daysBetween } from '../../../../shared/utils/calendar-days';
import { NationFlag, SponsorMark } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';
import { INVITATION_WELL, SPONSOR_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

/**
 * The icon in the reply bar's well, by where the offer stands.
 */
const ICONS = {
  awaiting: ClockIcon,
  accepted: CheckIcon,
  declined: XIcon,
  lapsed: ClockIcon,
} as const satisfies Record<keyof typeof INVITATION_WELL, LucideIcon>;

interface SponsorReaderProps {
  /**
   * The career, whose driver the mail is to.
   */
  career: Career;
  /**
   * The mail, which must hold a sponsor's offer.
   */
  item: InboxItem & { mail: { sponsor: SponsorOffer } };
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to sign it.
   */
  onSign: () => void;
  /**
   * Called to decline it.
   */
  onDecline: () => void;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// A sponsor's offer, opened beside the list: who it is, what it covers, pays
// and asks, and - for a slot already filled - the deal it would replace beside
// it. Its answer is pinned to its foot, with the way to the Sponsors page.
export const SponsorReader = ({
  career, item, busy, onSign, onDecline, onUnread,
}: SponsorReaderProps) => {
  const { t } = useTranslation();
  const { formatDay, formatDayShort } = useFormat();
  const { mail, status } = item;
  const offer = mail.sponsor;
  const replaces = offer.replaces === undefined
    ? null
    : career.sponsors.find((deal) => deal.id === offer.replaces) ?? null;
  const deadline = mail.deadline ?? '';
  const left = daysBetween(career.date, deadline);
  const Icon = status ? ICONS[status] : ClockIcon;
  const toSponsors = (
    <Button variant="outline" asChild>
      <Link to={path.sponsors()}>
        <SparklesIcon />
        {t('inbox.sponsor.open')}
      </Link>
    </Button>
  );

  let title = t('inbox.sponsor.reply.lapsed', { day: formatDayShort(deadline) });
  if (status === 'awaiting') {
    title = `${t('inbox.sponsor.reply.awaiting', { day: formatDayShort(deadline) })} · ${
      left > 0 ? t('inbox.reply.left', { count: left }) : t('inbox.reply.today')}`;
  } else if (status === 'accepted') {
    title = t('inbox.sponsor.reply.accepted', { day: formatDayShort(mail.reply?.on ?? '') });
  } else if (status === 'declined') {
    title = t('inbox.sponsor.reply.declined', { day: formatDayShort(mail.reply?.on ?? '') });
  }

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={SPONSOR_ACCENT[offer.slot]}>{t(`inbox.sponsor.kind.${offer.slot}`)}</Badge>
            <span className="ml-auto text-xs text-muted-foreground">{formatDay(mail.arrived)}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label={t('inbox.menu.label')}>
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onUnread}>
                  <MailIcon />
                  {t('inbox.menu.unread')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h2 className="text-xl font-semibold" data-selectable>
            {t(`inbox.sponsor.title.${offer.slot}`, { sponsor: offer.sponsor.name })}
          </h2>

          <div className="flex items-center gap-3">
            <SponsorMark sponsor={offer.sponsor} slot={offer.slot} />
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5 font-semibold">
                {offer.sponsor.name}
                <NationFlag code={offer.sponsor.nation} />
              </span>
              <span className="text-xs text-muted-foreground">{t('inbox.to', { driver: career.driver.name })}</span>
            </span>
          </div>

          <p className="max-w-prose text-sm leading-relaxed" data-selectable>
            {t(`inbox.sponsor.lede.${offer.slot}`, { sponsor: offer.sponsor.name })}
            {replaces ? ` ${t('inbox.sponsor.replaces', { sponsor: replaces.sponsor.name })}` : ''}
          </p>

          <SponsorCompare offer={offer} replaces={replaces} open={status === 'awaiting'} busy={busy} onSign={onSign} />
        </div>
      </div>

      {status ? (
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
            {status === 'awaiting' ? <span className="text-xs text-muted-foreground">{t('inbox.sponsor.reply.awaitingHint')}</span> : null}
          </span>
          <span className="flex gap-2">
            {toSponsors}
            {status === 'awaiting' ? <Button variant="outline" disabled={busy} onClick={onDecline}>{t('inbox.reply.decline')}</Button> : null}
          </span>
        </div>
      ) : null}
    </section>
  );
};

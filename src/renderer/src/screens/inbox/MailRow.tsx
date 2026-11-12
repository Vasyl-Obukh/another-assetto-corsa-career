import {
  BriefcaseIcon, HeadsetIcon, LandmarkIcon, MedalIcon, NewspaperIcon, RefreshCwIcon, SparklesIcon, TrophyIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { MailStatusChip } from './MailStatusChip.tsx';
import { offerSenders } from './utils.ts';
import type { Mail } from '../../../../shared/types';
import {
  initials, isPerson, newsAccent, newsSubject, paddockName, sponsorNewsSubject, TEAM_BUDGET_LABEL,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import {
  CONTRACT_ACCENT, DEBRIEF_ACCENT, HISTORIC_ACCENT, KEEP_ACCENT, LEDGER_ACCENT, RENEWAL_ACCENT, RESULTS_ACCENT,
  SPONSOR_ACCENT, TEAM_BUDGET_ACCENT,
} from '@/lib/accents';
import { keepMark } from '@/lib/contracts';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';
import { tierAccent, tierMetalKey } from '@/screens/championships';

interface MailRowProps {
  /**
   * The mail.
   */
  item: InboxItem;
  /**
   * The car an invitation offers, by name.
   */
  car: string;
  /**
   * What the run a seat offer or a piece of news is about is called - the
   * season's year for market news - or empty for an invitation.
   */
  edition: string;
  /**
   * Whether it is the mail open beside the list.
   */
  selected: boolean;
  /**
   * Called to open it.
   */
  onOpen: () => void;
}

const CHIP = 'shrink-0 px-1.5 py-0 text-[0.65rem]';

/**
 * The icon a mail the paddock sent is drawn with where a body rather than a
 * person wrote it.
 * @param mail The mail
 * @returns The icon
 */
const newsIcon = (mail: Mail): LucideIcon => {
  if (mail.debrief) return HeadsetIcon;
  if (mail.results) return TrophyIcon;
  if (mail.rung) return MedalIcon;

  return NewspaperIcon;
};

// One mail in the list: who it is from and when, what it is, and where it
// stands. Unopened, it is bold with a dot beside it. A seat offer lists who
// is offering by budget, which is what tells one edition's offers from
// another's at a glance, and team news says it is news. A sponsor's mail
// wears its slot's colour and says which slot it is for. Mail a person wrote
// carries their initials; mail of the paddock's wears its kind's colour.
export const MailRow = ({
  item, car, edition, selected, onOpen,
}: MailRowProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const { mail } = item;
  const unread = !mail.opened && !selected;
  const offer = item.offers[0];
  const { notice, from } = mail;
  const sponsor = mail.sponsor ?? mail.sponsorNews ?? null;
  const news = mail.sponsorNews ?? null;
  const subject = newsSubject(mail, edition, t);
  const renewal = mail.sponsor?.renews !== undefined || item.offers.some((one) => one.renews);
  const person = from ? isPerson(from) : false;
  // Each budget once, in the order the mail lists them, saying how many call.
  const budgets = [...new Set(item.offers.map((one) => one.budget))]
    .map((budget) => ({ budget, count: item.offers.filter((one) => one.budget === budget).length }));

  let accent: string = HISTORIC_ACCENT;
  let Icon: LucideIcon = LandmarkIcon;
  if (offer) [accent, Icon] = [CONTRACT_ACCENT, BriefcaseIcon];
  else if (sponsor) [accent, Icon] = [SPONSOR_ACCENT[sponsor.slot], news ? NewspaperIcon : SparklesIcon];
  else if (notice || subject !== null) [accent, Icon] = [newsAccent(mail) ?? CONTRACT_ACCENT, newsIcon(mail)];

  let sender = item.team?.name ?? t('inbox.organisers');
  if (from) sender = paddockName(from, t);
  else if (offer) sender = offerSenders(item.offers, t);
  else if (sponsor) sender = sponsor.sponsor.name;
  else if (notice) sender = notice.teamName;

  let title = t('inbox.subject.invitation', { event: item.event?.name ?? mail.invitation?.series ?? '' });
  if (subject !== null) title = subject;
  else if (offer?.bought) title = t('inbox.subject.bought', { series: offer.seriesName, edition });
  else if (offer) title = t('inbox.subject.offer', { series: offer.seriesName, edition, count: item.offers.length });
  else if (notice) title = t('inbox.subject.notice', { series: notice.seriesName, edition });
  else if (mail.sponsor?.renews) title = t('inbox.sponsor.title.renewal', { sponsor: mail.sponsor.sponsor.name });
  else if (news) title = sponsorNewsSubject(news, t);
  else if (sponsor) title = t(`inbox.subject.sponsor.${sponsor.slot}`);

  let chips: ReactNode = (
    <span className="truncate text-xs text-muted-foreground">
      {[car, item.entry?.name].filter(Boolean).join(' · ')}
    </span>
  );
  if (offer) {
    chips = budgets.map(({ budget, count }) => (
      <Badge key={budget} className={cn(CHIP, TEAM_BUDGET_ACCENT[budget])}>
        {count > 1
          ? t('inbox.offers.budgetCount', { budget: t(TEAM_BUDGET_LABEL[budget]), count })
          : t(TEAM_BUDGET_LABEL[budget])}
      </Badge>
    ));
  } else if (sponsor) {
    chips = (
      <Badge className={cn(CHIP, SPONSOR_ACCENT[sponsor.slot])}>
        {news ? t('inbox.kind.sponsorNews') : t(`sponsors.slot.${sponsor.slot}`)}
      </Badge>
    );
  } else if (notice) {
    const mark = notice.kind === 'halfway' ? keepMark({ keep: notice.keep }, notice.standing) : null;
    chips = (
      <>
        <Badge className={cn(CHIP, CONTRACT_ACCENT)}>{t('inbox.kind.notice')}</Badge>
        {mark ? <Badge className={cn(CHIP, KEEP_ACCENT[mark])}>{t(`championships.contract.mark.${mark}`)}</Badge> : null}
        {notice.kind === 'missed' ? <Badge className={cn(CHIP, LEDGER_ACCENT.fine)}>{t('finances.kind.fine')}</Badge> : null}
      </>
    );
  } else if (mail.debrief) {
    chips = (
      <>
        <Badge className={cn(CHIP, DEBRIEF_ACCENT)}>{t('inbox.chip.debrief')}</Badge>
        <span className="truncate text-xs text-muted-foreground">{mail.debrief.seriesName}</span>
      </>
    );
  } else if (mail.results) {
    chips = <Badge className={cn(CHIP, RESULTS_ACCENT)}>{t('inbox.chip.results')}</Badge>;
  } else if (mail.rung) {
    chips = (
      <Badge className={cn(CHIP, tierAccent(mail.rung.tier))}>
        {t('inbox.news.tier', { tier: mail.rung.tier, metal: t(tierMetalKey(mail.rung.tier)) })}
      </Badge>
    );
  } else if (mail.market) {
    chips = <Badge className={cn(CHIP, CONTRACT_ACCENT)}>{t('inbox.chip.market')}</Badge>;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={selected}
      className={cn(
        'grid w-full grid-cols-[0.5rem_2.25rem_minmax(0,1fr)] items-start gap-2.5 border-b px-3 py-2.5 text-left transition-colors hover:bg-accent/60',
        selected && 'bg-primary/10 hover:bg-primary/10',
      )}
    >
      <span aria-hidden className={cn('mt-2 size-2 rounded-full', unread ? 'bg-primary' : 'bg-transparent')} />
      <span
        className={cn(
          'grid size-9 place-items-center text-xs font-bold [&_svg]:size-4',
          person ? 'rounded-full' : 'rounded-lg',
          person && (notice || mail.results) ? CONTRACT_ACCENT : accent,
        )}
      >
        {person ? initials(sender) : <Icon />}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className={cn('min-w-0 flex-1 truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>{sender}</span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDayShort(mail.arrived)}</span>
        </span>
        <span className={cn('truncate text-sm', unread ? 'font-semibold' : 'text-foreground/90')}>{title}</span>
        <span className="flex min-w-0 items-center gap-1.5 pt-0.5">
          <MailStatusChip item={item} className={CHIP} />
          {renewal ? (
            <Badge className={cn('gap-1', CHIP, RENEWAL_ACCENT)}>
              <RefreshCwIcon className="size-2.5" />
              {t('inbox.renewal')}
            </Badge>
          ) : null}
          {chips}
        </span>
      </span>
    </button>
  );
};

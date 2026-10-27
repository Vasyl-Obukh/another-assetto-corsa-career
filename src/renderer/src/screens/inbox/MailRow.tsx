import { BriefcaseIcon, LandmarkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MailStatusChip } from './MailStatusChip.tsx';
import { offerSenders } from './utils.ts';
import { TEAM_BUDGET_LABEL } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT, HISTORIC_ACCENT, TEAM_BUDGET_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

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
   * What a seat offer's edition is called, or empty for an invitation.
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

// One mail in the list: who it is from and when, what it is, and where it
// stands. Unopened, it is bold with a dot beside it. A seat offer lists who
// is offering by budget, which is what tells one edition's offers from
// another's at a glance.
export const MailRow = ({
  item, car, edition, selected, onOpen,
}: MailRowProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const unread = !item.mail.opened && !selected;
  const offer = item.offers[0];
  // Each budget once, in the order the mail lists them, saying how many call.
  const budgets = [...new Set(item.offers.map((one) => one.budget))]
    .map((budget) => ({ budget, count: item.offers.filter((one) => one.budget === budget).length }));

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
      {/* The well wears the leather for an invitation, as it is to a historic
          event, and a contract's violet for a seat offer. */}
      <span className={cn('grid size-9 place-items-center rounded-lg [&_svg]:size-4', offer ? CONTRACT_ACCENT : HISTORIC_ACCENT)}>
        {offer ? <BriefcaseIcon /> : <LandmarkIcon />}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className={cn('min-w-0 flex-1 truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>
            {offer ? offerSenders(item.offers, t) : item.team?.name ?? t('inbox.organisers')}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDayShort(item.mail.arrived)}</span>
        </span>
        <span className={cn('truncate text-sm', unread ? 'font-semibold' : 'text-foreground/90')}>
          {offer
            ? t('inbox.subject.offer', { series: offer.seriesName, edition, count: item.offers.length })
            : t('inbox.subject.invitation', { event: item.event?.name ?? item.mail.invitation?.series ?? '' })}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 pt-0.5">
          <MailStatusChip item={item} className="shrink-0 px-1.5 py-0 text-[0.65rem]" />
          {offer ? budgets.map(({ budget, count }) => (
            <Badge key={budget} className={cn('shrink-0 px-1.5 py-0 text-[0.65rem]', TEAM_BUDGET_ACCENT[budget])}>
              {count > 1
                ? t('inbox.offers.budgetCount', { budget: t(TEAM_BUDGET_LABEL[budget]), count })
                : t(TEAM_BUDGET_LABEL[budget])}
            </Badge>
          )) : (
            <span className="truncate text-xs text-muted-foreground">
              {[car, item.entry?.name].filter(Boolean).join(' · ')}
            </span>
          )}
        </span>
      </span>
    </button>
  );
};

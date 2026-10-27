import { ArrowRightIcon, BriefcaseIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Career } from '../../../../shared/types';
import { awaitingMail } from '../../../../shared/utils/inbox';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface OffersBannerProps {
  /**
   * The career, whose inbox it reads.
   */
  career: Career;
}

// Home's word on seat offers still to be answered, as invitations have their
// own: how many championships have offers waiting, each by the day to answer
// by, soonest first, and the way into the inbox. Gone once none waits.
export const OffersBanner = ({ career }: OffersBannerProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const waiting = awaitingMail(career.inbox, career.date)
    .filter((mail) => mail.offers)
    .sort((left, right) => (left.deadline ?? '').localeCompare(right.deadline ?? ''));
  if (waiting.length === 0) return null;

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-contract-foreground/60 bg-card p-4">
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg [&_svg]:size-4', CONTRACT_ACCENT)}>
        <BriefcaseIcon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">{t('inbox.banner.offerTitle', { count: waiting.length })}</span>
        <span className="truncate text-sm text-muted-foreground">
          {waiting.map((mail) => t('inbox.banner.offerItem', {
            series: mail.offers?.[0]?.seriesName ?? '',
            day: formatDayShort(mail.deadline ?? ''),
          })).join(' · ')}
        </span>
      </span>
      <Button asChild variant="outline">
        <Link to={waiting.length === 1 ? path.inbox(waiting[0].id) : path.inbox()}>
          {t('inbox.banner.open')}
          <ArrowRightIcon />
        </Link>
      </Button>
    </section>
  );
};

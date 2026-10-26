import { ArrowRightIcon, MailIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Career } from '../../../../shared/types';
import { awaitingMail } from '../../../../shared/utils/inbox';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { HISTORIC_ACCENT } from '@/lib/accents';
import { inboxItem } from '@/lib/inbox';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface InvitationsBannerProps {
  /**
   * The career, whose inbox it reads.
   */
  career: Career;
}

// Home's word on invitations still to be answered: how many, each by the day
// it has to be answered by, and the way into the inbox. Gone once none waits.
export const InvitationsBanner = ({ career }: InvitationsBannerProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const waiting = awaitingMail(career.inbox, career.date).map((mail) => inboxItem(career, mail));
  if (waiting.length === 0) return null;

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-historic-foreground/60 bg-card p-4">
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg [&_svg]:size-4', HISTORIC_ACCENT)}>
        <MailIcon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">{t('inbox.banner.title', { count: waiting.length })}</span>
        <span className="truncate text-sm text-muted-foreground">
          {waiting.map((item) => t('inbox.banner.item', {
            event: item.event?.name ?? item.mail.invitation?.series ?? '',
            day: formatDayShort(item.mail.deadline ?? ''),
          })).join(' · ')}
        </span>
      </span>
      <Button asChild variant="outline">
        <Link to={waiting.length === 1 ? path.inbox(waiting[0].mail.id) : path.inbox()}>
          {t('inbox.banner.open')}
          <ArrowRightIcon />
        </Link>
      </Button>
    </section>
  );
};

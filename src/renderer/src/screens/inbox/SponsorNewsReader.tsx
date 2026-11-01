import { MailIcon, MoreVerticalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Career, SponsorNews } from '../../../../shared/types';
import {
  goalText, MoneyAmount, NationFlag, SponsorMark,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';
import { KEEP_ACCENT, SPONSOR_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';

interface SponsorNewsReaderProps {
  /**
   * The career, whose driver the mail is to.
   */
  career: Career;
  /**
   * The mail, which must hold sponsor news.
   */
  item: InboxItem & { mail: { sponsorNews: SponsorNews } };
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// A sponsor saying a deal's year ran out with its goal missed: what the goal
// asked, how far the player got, and what the deal paid. It wants no answer.
export const SponsorNewsReader = ({ career, item, onUnread }: SponsorNewsReaderProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  const { mail } = item;
  const news = mail.sponsorNews;
  const { goal } = news;
  const reached = goal.kind === 'onTarget'
    ? t('sponsors.progress.share', { percent: Math.round(news.reached * 100) })
    : t(goal.kind === 'championshipPlace' ? 'sponsors.progress.place' : 'inbox.sponsorNews.reached', {
      place: news.reached, count: news.reached,
    });

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex max-w-3xl flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={SPONSOR_ACCENT[news.slot]}>{t('inbox.kind.sponsorNews')}</Badge>
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
            {t('inbox.subject.sponsorNews', { sponsor: news.sponsor.name })}
          </h2>

          <div className="flex items-center gap-3">
            <SponsorMark sponsor={news.sponsor} slot={news.slot} />
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5 font-semibold">
                {news.sponsor.name}
                <NationFlag code={news.sponsor.nation} />
              </span>
              <span className="text-xs text-muted-foreground">{t('inbox.to', { driver: career.driver.name })}</span>
            </span>
          </div>

          <p className="max-w-prose text-sm leading-relaxed" data-selectable>
            {t('inbox.sponsorNews.lede', { sponsor: news.sponsor.name })}
          </p>

          <div className="grid grid-cols-[8rem_minmax(0,1fr)] overflow-hidden rounded-lg border text-sm">
            <span className="border-b bg-muted/30 px-3 py-2 text-xs text-muted-foreground">{t('inbox.sponsorNews.goal')}</span>
            <span className="flex flex-col gap-0.5 border-b px-3 py-2">
              <span className="flex flex-wrap items-center gap-2 font-medium">
                {goalText(goal, t)}
                <Badge className={KEEP_ACCENT.short}>{t('inbox.sponsorNews.missed')}</Badge>
              </span>
              <span className="text-xs text-muted-foreground">{reached}</span>
            </span>
            <span className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground">{t('inbox.sponsorNews.paid')}</span>
            <span className="px-3 py-2"><MoneyAmount amount={news.paid} /></span>
          </div>
        </div>
      </div>
    </section>
  );
};

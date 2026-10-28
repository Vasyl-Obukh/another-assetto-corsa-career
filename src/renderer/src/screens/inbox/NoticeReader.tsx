import {
  ChevronRightIcon, ExternalLinkIcon, MailIcon, MoreHorizontalIcon, NewspaperIcon, TrophyIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import type { Career, TeamNotice } from '../../../../shared/types';
import { NationFlag } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';
import { KeepBlock } from '@/screens/championships';

interface NoticeReaderProps {
  /**
   * The career, whose driver the mail is to.
   */
  career: Career;
  /**
   * The mail, which must hold team news.
   */
  item: InboxItem & { mail: { notice: TeamNotice } };
  /**
   * What the run the contract was for is called.
   */
  edition: string;
  /**
   * That run's championship page.
   */
  link: string;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// A team telling the player it is not keeping them on, opened beside the list:
// what it asked of them, where they and their teammate finished, and that the
// contract simply ran its course. Team news wants no answer, so there is no
// reply bar.
export const NoticeReader = ({
  career, item, edition, link, onUnread,
}: NoticeReaderProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  const navigate = useNavigate();
  const { mail } = item;
  const { notice } = mail;

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex max-w-3xl flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={CONTRACT_ACCENT}>{t('inbox.kind.notice')}</Badge>
            <span className="ml-auto text-xs text-muted-foreground">{formatDay(mail.arrived)}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label={t('inbox.menu.label')}>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onUnread}>
                  <MailIcon />
                  {t('inbox.menu.unread')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { void navigate(link); }}>
                  <ExternalLinkIcon />
                  {t('inbox.offer.reply.open')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h2 className="text-xl font-semibold" data-selectable>
            {t('inbox.subject.notice', { series: notice.seriesName, edition })}
          </h2>

          <div className="flex items-center gap-3">
            <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg [&_svg]:size-5', CONTRACT_ACCENT)}>
              <NewspaperIcon />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5 font-semibold">
                {notice.teamName}
                {notice.nation ? <NationFlag code={notice.nation} /> : null}
              </span>
              <span className="text-xs text-muted-foreground">{t('inbox.to', { driver: career.driver.name })}</span>
            </span>
          </div>

          <Link to={link} className="hover-outline flex items-center gap-3 rounded-lg border bg-card px-3.5 py-2.5">
            <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4', CONTRACT_ACCENT)}>
              <TrophyIcon />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold">
                {t('inbox.notice.run', { series: notice.seriesName, edition })}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {t('inbox.notice.strip', { team: notice.teamName, entry: notice.entryName })}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              {t('inbox.offers.open')}
              <ChevronRightIcon className="size-4" />
            </span>
          </Link>

          <p className="max-w-prose text-sm leading-relaxed" data-selectable>
            {t('inbox.notice.lede', { team: notice.teamName, place: notice.keep })}
          </p>

          <div className="rounded-lg border p-3">
            <KeepBlock contract={{ keep: notice.keep, kept: 'released' }} standing={notice.standing} />
          </div>

          <p className="text-sm text-muted-foreground">
            {t('inbox.notice.owed')}
            {' '}
            {t('inbox.notice.after')}
          </p>
        </div>
      </div>
    </section>
  );
};

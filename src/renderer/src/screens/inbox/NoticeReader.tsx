import { BriefcaseIcon, NewspaperIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Career, TeamNotice } from '../../../../shared/types';
import {
  MailFrame, MailStrip, NationFlag, Sender,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
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
// what it asked of them and where they and their teammate finished.
export const NoticeReader = ({
  career, item, edition, link, onUnread,
}: NoticeReaderProps) => {
  const { t } = useTranslation();
  const { mail } = item;
  const { notice } = mail;

  return (
    <MailFrame
      chips={<Badge className={CONTRACT_ACCENT}>{t('inbox.kind.notice')}</Badge>}
      arrived={mail.arrived}
      title={t('inbox.subject.notice', { series: notice.seriesName, edition })}
      onUnread={onUnread}
      link={{ to: link, label: t('inbox.offer.reply.open') }}
    >
      {/* News sent before people wrote it comes from the team itself. */}
      {mail.from ? (
        <Sender from={mail.from} driver={career.driver.name} accent={CONTRACT_ACCENT} icon={BriefcaseIcon} />
      ) : (
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
      )}

      <MailStrip
        to={link}
        icon={TrophyIcon}
        accent={CONTRACT_ACCENT}
        title={t('inbox.notice.run', { series: notice.seriesName, edition })}
        detail={t('inbox.notice.strip', { team: notice.teamName, entry: notice.entryName })}
        open={t('inbox.offers.open')}
      />

      <p className="max-w-prose text-sm leading-relaxed" data-selectable>
        {t('inbox.notice.lede', { team: notice.teamName, place: notice.keep })}
      </p>

      <div className="rounded-lg border p-3">
        <KeepBlock contract={{ keep: notice.keep, kept: 'released' }} standing={notice.standing} />
      </div>
    </MailFrame>
  );
};

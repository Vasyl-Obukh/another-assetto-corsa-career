import { useTranslation } from 'react-i18next';

import { ClimbRises } from './ClimbRises.tsx';
import { GoalReward } from './GoalReward.tsx';
import type { Career, SponsorNews } from '../../../../shared/types';
import {
  goalText, MailFrame, MoneyAmount, NationFlag, SponsorMark, sponsorNewsSubject,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { KEEP_ACCENT, SPONSOR_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { tierMetalKey } from '@/screens/championships';

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

// A sponsor saying a deal's year ran out with its goal missed - what the goal
// asked, how far the player got and what the deal paid - that its goal is met,
// with the car it brought, or that it has climbed with the player, each figure
// saying what it paid. It wants no answer.
export const SponsorNewsReader = ({ career, item, onUnread }: SponsorNewsReaderProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const { mail } = item;
  const news = mail.sponsorNews;
  const { goal } = news;
  const reached = goal.kind === 'onTarget'
    ? t('sponsors.progress.share', { percent: Math.round(news.reached * 100) })
    : t(goal.kind === 'championshipPlace' ? 'sponsors.progress.place' : 'inbox.sponsorNews.reached', {
      place: news.reached, count: news.reached,
    });

  return (
    <MailFrame
      chips={<Badge className={SPONSOR_ACCENT[news.slot]}>{t('inbox.kind.sponsorNews')}</Badge>}
      arrived={mail.arrived}
      title={sponsorNewsSubject(news, t)}
      onUnread={onUnread}
    >
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
        {news.kind === 'climbed' ? t('inbox.sponsorNews.climbed.lede', {
          sponsor: news.sponsor.name, rung: t(tierMetalKey(news.rung ?? 1)),
        }) : null}
        {news.kind === 'goalMet' ? [
          t('inbox.sponsorNews.goalMet.lede', { goal: goalText(goal, t) }),
          news.car && news.carPaid === undefined ? t('inbox.sponsorNews.goalMet.car') : null,
          news.carPaid === undefined ? null : t('inbox.sponsorNews.goalMet.carPaid', {
            car: news.car?.name ?? '', amount: formatMoney(news.carPaid),
          }),
          news.bonus ? t('inbox.sponsorNews.goalMet.bonus', { amount: formatMoney(news.bonus) }) : null,
        ].filter(Boolean).join(' ') : null}
        {news.kind ? null : t('inbox.sponsorNews.lede', { sponsor: news.sponsor.name })}
      </p>

      {news.kind === 'goalMet' && news.car && news.carPaid === undefined ? <GoalReward car={news.car} /> : null}

      {news.kind === 'climbed' ? <ClimbRises rises={news.rises ?? []} /> : null}

      {news.kind ? null : (
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
      )}
    </MailFrame>
  );
};

import {
  BriefcaseIcon, CarIcon, TargetIcon, TrophyIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Career, TeamNotice } from '../../../../shared/types';
import {
  carPictureSources, ContentImage, initials, MailFrame, MailStrip, MailTile, MoneyAmount, NationFlag, newsSubject,
  ResultCell, Sender,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT, DEBRIEF_ACCENT, LEDGER_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';
import { KeepBlock } from '@/screens/championships';

interface TeamNewsReaderProps {
  /**
   * The career, whose driver the mail is to.
   */
  career: Career;
  /**
   * The mail, which must hold team news of a kind - a welcome, a halfway word
   * or a round missed.
   */
  item: InboxItem & { mail: { notice: TeamNotice } };
  /**
   * What the run the contract is for is called.
   */
  run: string;
  /**
   * That run's championship page.
   */
  link: string;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// A contract's team writing as it runs: a welcome as it is signed - the car,
// the engineer, the teammate and what keeps the player on - a halfway word,
// On course or Short of it, and a round missed with its fine and how the
// reserve driver did.
export const TeamNewsReader = ({
  career, item, run, link, onUnread,
}: TeamNewsReaderProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  const { mail } = item;
  const { notice } = mail;
  const carName = useCarNames(notice.car ? [notice.car.model] : []);
  // A privateer asks nothing of the player.
  const asks = notice.keep < notice.standing.size;

  return (
    <MailFrame
      chips={(
        <>
          <Badge className={CONTRACT_ACCENT}>{t('inbox.kind.notice')}</Badge>
          {notice.kind === 'missed' ? <Badge className={LEDGER_ACCENT.fine}>{t('finances.kind.fine')}</Badge> : null}
        </>
      )}
      arrived={mail.arrived}
      title={newsSubject(mail, run, t) ?? ''}
      onUnread={onUnread}
      link={{ to: link, label: t('inbox.news.open.championship') }}
    >
      <Sender
        from={mail.from ?? { role: 'manager', teamName: notice.teamName }}
        driver={career.driver.name}
        accent={CONTRACT_ACCENT}
        icon={BriefcaseIcon}
      />

      <MailStrip
        to={link}
        icon={TrophyIcon}
        accent={CONTRACT_ACCENT}
        title={t('inbox.notice.run', { series: notice.seriesName, edition: run })}
        detail={(
          <>
            {notice.nation ? <NationFlag code={notice.nation} /> : null}
            {t('inbox.news.strip', { team: notice.teamName, entry: notice.entryName })}
          </>
        )}
        open={t('inbox.offers.open')}
      />

      {notice.kind === 'welcome' ? (
        <>
          <div className="flex max-w-prose flex-col gap-3 text-sm leading-relaxed" data-selectable>
            <p>
              {t(notice.renewal ? 'inbox.news.welcome.ledeBack' : 'inbox.news.welcome.lede', {
                series: notice.seriesName,
                edition: run,
                round: notice.opener?.name ?? '',
                day: notice.opener ? formatDay(notice.opener.date) : '',
              })}
            </p>
            {asks ? <p>{t('inbox.news.welcome.keep', { place: notice.keep, entry: notice.entryName })}</p> : null}
          </div>

          {notice.car ? (
            <div className="flex items-center gap-3">
              <span className="relative aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-md bg-muted">
                <ContentImage
                  sources={carPictureSources(notice.car.model, notice.car.skin)}
                  alt={carName(notice.car.model)}
                  className="object-cover"
                  fallback={(
                    <span className="absolute inset-0 grid place-items-center">
                      <CarIcon className="size-5 text-muted-foreground/40" />
                    </span>
                  )}
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-semibold">{carName(notice.car.model)}</span>
                <span className="text-xs text-muted-foreground">{t('inbox.news.welcome.car', { team: notice.teamName })}</span>
              </span>
            </div>
          ) : null}

          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              notice.engineer?.name
                ? { name: notice.engineer.name, nation: notice.engineer.nation, role: t('inbox.news.welcome.engineer'), accent: DEBRIEF_ACCENT }
                : null,
              notice.mate
                ? { name: notice.mate.name, nation: notice.mate.nation, role: t('inbox.news.welcome.mate'), accent: CONTRACT_ACCENT }
                : null,
            ].filter((one) => one !== null).map((person) => (
              <div key={person.role} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold', person.accent)}>
                  {initials(person.name)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1.5 truncate text-sm font-semibold">
                    {person.name}
                    {person.nation ? <NationFlag code={person.nation} /> : null}
                  </span>
                  <span className="text-xs text-muted-foreground">{person.role}</span>
                </span>
              </div>
            ))}
          </div>

          {asks ? (
            <span className="flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold">
              <TargetIcon className="size-4 shrink-0 text-contract-foreground" />
              {t('championships.contract.keepPlace', { place: notice.keep })}
            </span>
          ) : null}
        </>
      ) : null}

      {notice.kind === 'halfway' ? (
        <>
          <p className="max-w-prose text-sm leading-relaxed" data-selectable>
            {t(notice.standing.kept ? 'inbox.news.halfway.on' : 'inbox.news.halfway.short', {
              done: notice.rounds?.done ?? 0,
              left: (notice.rounds?.of ?? 0) - (notice.rounds?.done ?? 0),
            })}
          </p>
          <div className="rounded-lg border p-3">
            <KeepBlock contract={{ keep: notice.keep }} standing={notice.standing} />
          </div>
        </>
      ) : null}

      {notice.kind === 'missed' ? (
        <>
          <p className="max-w-prose text-sm leading-relaxed" data-selectable>
            {t('inbox.news.missed.lede', { round: notice.round?.name ?? '' })}
          </p>
          <dl className="grid grid-cols-2 divide-x overflow-hidden rounded-lg border">
            <MailTile label={t('inbox.news.missed.fine')} detail={t('inbox.news.missed.fineHint')}>
              <MoneyAmount amount={-(notice.fine ?? 0)} />
            </MailTile>
            <MailTile
              label={t('inbox.news.missed.car')}
              detail={t('inbox.news.missed.carHint', { count: notice.places?.length ?? 0 })}
              className="flex-wrap gap-1"
            >
              {(notice.places ?? []).map((place, at) => (place === null
                // eslint-disable-next-line react/no-array-index-key -- a race's place has nothing else to key on
                ? <span key={at} className="text-muted-foreground">{t('common.dash')}</span>
                // eslint-disable-next-line react/no-array-index-key -- a race's place has nothing else to key on
                : <ResultCell key={at} position={place} scored={false} prefixed />))}
            </MailTile>
          </dl>
        </>
      ) : null}
    </MailFrame>
  );
};

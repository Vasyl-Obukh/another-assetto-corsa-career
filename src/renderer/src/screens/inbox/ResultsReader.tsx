import { BriefcaseIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { reviewLink } from './utils.ts';
import type { Career, EditionResult } from '../../../../shared/types';
import {
  MailFrame, MailStrip, MailTile, MoneyAmount, NationFlag, newsSubject, ResultCell, Sender,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT, RESULTS_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

interface ResultsReaderProps {
  /**
   * The career, whose driver the mail is to.
   */
  career: Career;
  /**
   * The mail, which must hold a championship's result.
   */
  item: InboxItem & { mail: { results: EditionResult } };
  /**
   * What the run is called.
   */
  run: string;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// How an edition ended: under contract from the team's boss, with the
// teammate and the teams' table, on the player's own from the organisers. The
// player's place, what it paid, the top of the class's table and the review.
export const ResultsReader = ({
  career, item, run, onUnread,
}: ResultsReaderProps) => {
  const { t } = useTranslation();
  const { formatMoney, formatNumber } = useFormat();
  const { mail } = item;
  const { results } = mail;
  const from = mail.from ?? { role: 'organisers' as const, name: results.seriesName };
  const organisers = from.role === 'organisers';
  const champion = results.place === 1;
  const link = reviewLink(results);
  const share = results.purse && results.purse > 0 ? Math.round((results.paid / results.purse) * 100) : null;

  let lede = t('inbox.news.results.ledeNone', { series: results.seriesName, edition: run });
  if (champion) lede = t('inbox.news.results.ledeChampion', { entry: results.entryName, points: formatNumber(results.points) });
  else if (results.place !== null) {
    lede = t('inbox.news.results.lede', {
      series: results.seriesName,
      edition: run,
      place: results.place,
      entry: results.entryName,
      points: formatNumber(results.points),
    });
  }
  const said = [
    lede,
    results.mate && results.mate.place !== null
      ? t('inbox.news.results.mate', { name: results.mate.name, place: results.mate.place })
      : null,
    results.team && results.team.place !== null
      ? t('inbox.news.results.team', { team: results.team.name, place: results.team.place, of: results.team.of })
      : null,
  ].filter((line) => line !== null).join(' ');
  const paid = [
    results.paid > 0 ? t(share === null ? 'inbox.news.results.paid' : 'inbox.news.results.paidShare') : null,
    results.bonus ? t('inbox.news.results.bonus') : null,
  ].filter((line) => line !== null).join(' ');

  return (
    <MailFrame
      chips={<Badge className={RESULTS_ACCENT}>{t('inbox.chip.results')}</Badge>}
      arrived={mail.arrived}
      title={newsSubject(mail, run, t) ?? ''}
      onUnread={onUnread}
      link={{ to: link, label: t('inbox.news.open.review') }}
    >
      <Sender
        from={from}
        driver={career.driver.name}
        accent={organisers ? RESULTS_ACCENT : CONTRACT_ACCENT}
        icon={organisers ? TrophyIcon : BriefcaseIcon}
      />

      {champion ? (
        <section className="flex items-center gap-4 rounded-xl border border-podium-gold-foreground/25 bg-podium-gold/60 px-4 py-3 shadow-sm">
          <TrophyIcon className="size-5 shrink-0 text-podium-gold-foreground" />
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">{t('inbox.news.results.champion', { entry: results.entryName })}</span>
            <span className="text-sm text-muted-foreground">{t('inbox.notice.run', { series: results.seriesName, edition: run })}</span>
          </span>
        </section>
      ) : null}

      <div className="flex max-w-prose flex-col gap-3 text-sm leading-relaxed" data-selectable>
        <p>{said}</p>
        {paid ? <p>{paid}</p> : null}
      </div>

      <dl className="grid grid-cols-2 divide-x overflow-hidden rounded-lg border sm:grid-cols-4">
        <MailTile
          label={t('inbox.news.results.tile.you')}
          detail={[
            t('inbox.news.debrief.points', { count: results.points }),
            t('inbox.news.results.wins', { count: results.wins }),
            t('inbox.news.results.podiums', { count: results.podiums }),
          ].join(' · ')}
        >
          {results.place === null
            ? t('common.dash')
            : <ResultCell position={results.place} scored={results.points > 0} prefixed />}
        </MailTile>
        {results.mate ? (
          <MailTile label={results.mate.name} detail={t('inbox.news.debrief.points', { count: results.mate.points })}>
            {results.mate.place === null
              ? t('common.dash')
              : <ResultCell position={results.mate.place} scored={results.mate.points > 0} prefixed />}
          </MailTile>
        ) : null}
        {results.team ? (
          <MailTile label={results.team.name} detail={t('inbox.news.results.tile.teams', { of: results.team.of })}>
            {results.team.place === null
              ? t('common.dash')
              : <ResultCell position={results.team.place} scored prefixed />}
          </MailTile>
        ) : null}
        <MailTile
          label={t('inbox.news.results.tile.paid')}
          detail={[
            share !== null && results.purse
              ? t('inbox.news.results.tile.share', { percent: share, purse: formatMoney(results.purse) })
              : t('inbox.news.results.tile.prize'),
            results.bonus ? t('inbox.news.results.tile.withBonus', { bonus: formatMoney(results.bonus) }) : null,
          ].filter((line) => line !== null).join(' · ')}
        >
          <MoneyAmount amount={results.paid + (results.bonus ?? 0)} />
        </MailTile>
      </dl>

      <div className="overflow-hidden rounded-lg border">
        <div className="border-b bg-muted/40 px-3 py-2 text-sm font-semibold">
          {t('inbox.news.results.table', { entry: results.entryName })}
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="w-16 px-3 py-1.5 text-left font-medium">{t('inbox.news.results.position')}</th>
              <th className="px-3 py-1.5 text-left font-medium">{t('inbox.news.results.driver')}</th>
              <th className="px-3 py-1.5 text-left font-medium">{t('inbox.news.results.teamHead')}</th>
              <th className="px-3 py-1.5 text-right font-medium">{t('inbox.news.results.points')}</th>
            </tr>
          </thead>
          <tbody>
            {results.top.map((row) => (
              <tr key={row.position} className={cn('border-b last:border-b-0', row.player && 'bg-primary/5')}>
                <td className="px-3 py-1.5"><ResultCell position={row.position} scored={row.points > 0} /></td>
                <td className="px-3 py-1.5">
                  <span className={cn('flex items-center gap-1.5', row.player && 'font-semibold')}>
                    {(row.player ? career.driver.nation : row.nation) ? (
                      <NationFlag code={(row.player ? career.driver.nation : row.nation) ?? ''} />
                    ) : null}
                    {row.player ? career.driver.name : row.name}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">{row.team ?? t('common.dash')}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{formatNumber(row.points)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MailStrip
        to={link}
        icon={TrophyIcon}
        accent={RESULTS_ACCENT}
        title={t('inbox.news.results.review', { series: results.seriesName, edition: run })}
        detail={t('inbox.news.results.reviewHint')}
        open={t('inbox.news.open.review')}
      />
    </MailFrame>
  );
};

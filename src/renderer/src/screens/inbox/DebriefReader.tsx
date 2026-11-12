import { HeadsetIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { roundLink } from './utils.ts';
import type { Career, Debrief } from '../../../../shared/types';
import { formatLapTime } from '../../../../shared/utils/lap-time';
import {
  debriefLines, debriefSubject, gapText, HistoricChip, MailFrame, MailStrip, MailTile, Movement, ResultCell, Sender,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { DEBRIEF_ACCENT, SESSION_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { sessionName } from '@/lib/session-labels';

interface DebriefReaderProps {
  /**
   * The career, whose driver the mail is to.
   */
  career: Career;
  /**
   * The mail, which must hold a debrief.
   */
  item: InboxItem & { mail: { debrief: Debrief } };
  /**
   * What the run the round is of is called.
   */
  run: string;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// A round the player drove, as their engineer reports it: a few sentences,
// a row a qualifying and race with places in the class, then where the
// championship stands and what comes next.
export const DebriefReader = ({
  career, item, run, onUnread,
}: DebriefReaderProps) => {
  const { t } = useTranslation();
  const { formatDay, formatDayShort, formatNumber } = useFormat();
  const { mail } = item;
  const { debrief } = mail;
  const carName = useCarNames([debrief.car]);
  const link = roundLink(career, debrief);
  const points = debrief.sessions.reduce((sum, one) => sum + (one.points ?? 0), 0);
  const races = debrief.sessions.some((one) => one.type === 'race');
  // How far a place moved, or nothing to say while there was no place before.
  const move = (place: number | null, was: number | null): number | null => (
    place === null || was === null ? null : was - place
  );

  return (
    <MailFrame
      chips={(
        <>
          <Badge className={DEBRIEF_ACCENT}>{t('inbox.chip.debrief')}</Badge>
          {debrief.historic ? <HistoricChip /> : null}
        </>
      )}
      arrived={mail.arrived}
      title={debriefSubject(debrief, t)}
      onUnread={onUnread}
      link={{ to: link, label: t('inbox.news.open.round') }}
    >
      <Sender from={mail.from ?? { role: 'engineer' }} driver={career.driver.name} accent={DEBRIEF_ACCENT} icon={HeadsetIcon} />

      <MailStrip
        to={link}
        icon={TrophyIcon}
        accent={DEBRIEF_ACCENT}
        title={debrief.historic
          ? t('inbox.news.debrief.stripHistoric', { series: debrief.seriesName })
          : t('inbox.news.debrief.strip', {
            series: debrief.seriesName, edition: run, number: debrief.number, rounds: debrief.rounds,
          })}
        detail={[debrief.roundName, carName(debrief.car), debrief.entryName].join(' · ')}
        open={t('inbox.news.open.round')}
      />

      <div className="flex max-w-prose flex-col gap-3 text-sm leading-relaxed" data-selectable>
        {debriefLines(debrief, t, formatDay).map((line) => <p key={line}>{line}</p>)}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2 text-sm font-semibold">
          {t('inbox.news.debrief.table.title')}
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {t('inbox.news.debrief.table.of', { entry: debrief.entryName, count: debrief.sessions[0]?.of ?? 0 })}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="px-3 py-1.5 text-left font-medium">{t('inbox.news.debrief.table.session')}</th>
              <th className="px-3 py-1.5 text-left font-medium">{t('inbox.news.debrief.table.started')}</th>
              <th className="px-3 py-1.5 text-left font-medium">{t('inbox.news.debrief.table.finished')}</th>
              <th className="px-3 py-1.5 text-right font-medium">{t('inbox.news.debrief.table.best')}</th>
              <th className="px-3 py-1.5 text-right font-medium">{t('inbox.news.debrief.table.gap')}</th>
              {debrief.mate ? <th className="px-3 py-1.5 text-left font-medium">{debrief.mate.name}</th> : null}
              {races ? <th className="px-3 py-1.5 text-right font-medium">{t('inbox.news.debrief.table.points')}</th> : null}
            </tr>
          </thead>
          <tbody>
            {debrief.sessions.map((session) => {
              const quiet = session.type === 'qualify';

              return (
                <tr key={session.index} className="border-b last:border-b-0">
                  <td className="px-3 py-2">
                    <Badge className={SESSION_ACCENT[session.type]}>
                      {sessionName({ name: session.name, type: session.type }, t)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {session.grid === null
                      ? <span className="text-muted-foreground">{t('common.dash')}</span>
                      : <ResultCell position={session.grid} scored={false} quiet prefixed />}
                  </td>
                  <td className="px-3 py-2">
                    {session.place === null
                      ? <span className="text-muted-foreground">{t('common.dash')}</span>
                      : (
                        <ResultCell
                          position={session.place}
                          scored={(session.points ?? 0) > 0}
                          quiet={quiet}
                          prefixed
                        />
                      )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatLapTime(session.best)}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                    {session.gap === null || session.gap <= 0 ? t('common.dash') : `+${gapText(session.gap)}`}
                  </td>
                  {debrief.mate ? (
                    <td className="px-3 py-2">
                      {session.mate === null
                        ? <span className="text-muted-foreground">{t('common.dash')}</span>
                        : <ResultCell position={session.mate} scored={false} quiet prefixed />}
                    </td>
                  ) : null}
                  {races ? (
                    <td className="px-3 py-2 text-right tabular-nums">
                      {session.points === undefined ? t('common.dash') : formatNumber(session.points)}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dl className="grid grid-cols-2 divide-x overflow-hidden rounded-lg border sm:grid-cols-4">
        {debrief.historic ? null : (
          <MailTile
            label={t('inbox.news.debrief.tile.championship')}
            detail={t('inbox.news.debrief.points', { count: debrief.standing.points })}
          >
            {debrief.standing.place === null ? t('common.dash') : t('inbox.news.place', { place: debrief.standing.place })}
            <Movement move={move(debrief.standing.place, debrief.standing.was)} />
          </MailTile>
        )}
        <MailTile label={t('inbox.news.debrief.tile.round')}>
          {points > 0 ? t('inbox.news.debrief.points', { count: points }) : t('inbox.news.debrief.noPoints')}
        </MailTile>
        {debrief.mate && !debrief.historic ? (
          <MailTile label={debrief.mate.name} detail={t('inbox.news.debrief.points', { count: debrief.mate.points })}>
            {debrief.mate.place === null ? t('common.dash') : t('inbox.news.place', { place: debrief.mate.place })}
            <Movement move={move(debrief.mate.place, debrief.mate.was)} />
          </MailTile>
        ) : null}
        {debrief.historic ? null : (
          <MailTile
            label={t('inbox.news.debrief.tile.next')}
            detail={debrief.next ? formatDayShort(debrief.next.date) : undefined}
            className="truncate"
          >
            {debrief.next?.name ?? t('inbox.news.debrief.tile.last')}
          </MailTile>
        )}
      </dl>
    </MailFrame>
  );
};

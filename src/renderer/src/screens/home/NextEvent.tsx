import { ArrowRightIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { EventSessions } from './EventSessions.tsx';
import { SeatLine } from './SeatLine.tsx';
import type { CalendarEntry } from '../../../../shared/types';
import { daysBetween } from '../../../../shared/utils/calendar-days';
import { ConfirmDialog, HistoricChip } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT, LEDGER_ACCENT } from '@/lib/accents';
import { linkRun, path } from '@/lib/routes';
import type { HistoricRow } from '@/lib/season-review';
import { tierAccent } from '@/screens/championships';
import { LayoutMap } from '@/screens/track-browser';

interface NextEventProps {
  /**
   * The event.
   */
  event: CalendarEntry;
  /**
   * The other entered events on the same day.
   */
  clashes: readonly CalendarEntry[];
  /**
   * The ISO date the career's clock stands at.
   */
  today: string;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to move the clock to the event's day.
   */
  onAdvance: () => void;
  /**
   * The seat a historic event invites the player into, or null for a round of
   * a championship.
   */
  seat: HistoricRow | null;
  /**
   * Called once the player has confirmed declining a historic event.
   */
  onDecline: () => void;
}

export const NextEvent = ({
  event, clashes, today, busy, onAdvance, seat, onDecline,
}: NextEventProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatMoney } = useFormat();
  const [declining, setDeclining] = useState(false);
  const days = daysBetween(today, event.date);

  return (
    <section className="grid overflow-hidden rounded-xl border bg-card shadow-sm sm:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="flex min-w-0 flex-col gap-3 p-5">
        <span className="text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
          {t('home.nextEvent')}
        </span>

        <div className="flex items-baseline gap-2.5">
          {days > 0 ? (
            <>
              <span className="text-4xl leading-none font-bold tabular-nums">{days}</span>
              <span className="text-muted-foreground">
                {t('home.daysToGo', { count: days, day: formatDayShort(event.date) })}
              </span>
            </>
          ) : (
            <span className="text-xl font-semibold">{t('home.underWay')}</span>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <h2 className="truncate text-xl font-semibold">{event.seriesName}</h2>
          {/* A historic event is one event, so it has no round to name. */}
          {event.historic ? null : (
            <p className="text-muted-foreground">
              {t('home.roundAt', { number: event.number, round: event.roundName })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {event.historic ? <HistoricChip /> : null}
          <Badge className={DISCIPLINE_ACCENT[event.ladder.discipline]}>{event.entryName}</Badge>
          <Badge className={tierAccent(event.ladder.tier)}>
            {t('championships.tier', { tier: event.ladder.tier })}
          </Badge>
          {/* Neutral on purpose: a grid size is a quantity, not one of a set. */}
          <Badge variant="outline">{t('calendar.grid', { count: event.gridSize })}</Badge>
          {/* The money in the colours the ledger writes it in: a fee as a fee,
              a prize as a race's. */}
          {event.entryFee ? (
            <Badge className={LEDGER_ACCENT.fee}>{t('event.money.fee', { amount: formatMoney(event.entryFee) })}</Badge>
          ) : null}
          {event.prize === null ? null : (
            <Badge className={LEDGER_ACCENT.race}>{t('home.prize', { amount: formatMoney(event.prize) })}</Badge>
          )}
        </div>

        {seat ? <SeatLine seat={seat} /> : null}

        <EventSessions series={event.series} round={event.round} edition={event.edition} />

        {clashes.length > 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-warning/20 px-3 py-2 text-sm">
            <Badge className="border-transparent bg-warning text-warning-foreground">{t('calendar.clash')}</Badge>
            {t('home.clashWith', {
              names: clashes.map((other) => `${other.seriesName} ${t('calendar.round', { number: other.number })}`)
                .join(', '),
            })}
          </div>
        ) : null}

        <div className="mt-1 flex flex-wrap gap-2">
          <Button asChild>
            <Link
              to={path.event(
                { series: event.series, round: event.round },
                linkRun({ season: 0, edition: event.edition }, 0, event.editions),
              )}
            >
              {t('home.goToEvent')}
              <ArrowRightIcon />
            </Link>
          </Button>
          {days > 0 ? (
            <Button variant="outline" disabled={busy} title={t('calendar.advanceHint')} onClick={onAdvance}>
              {t('home.advanceTo', { day: formatDayShort(event.date) })}
            </Button>
          ) : null}
          {seat && seat.outcome === 'scheduled' && !seat.started ? (
            <Button variant="ghost" disabled={busy} onClick={() => setDeclining(true)}>
              {t('historic.decline.action')}
            </Button>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={declining}
        busy={busy}
        title={t('historic.decline.title', { name: event.seriesName })}
        description={t('historic.decline.body')}
        confirmLabel={t('historic.decline.confirm')}
        onClose={() => setDeclining(false)}
        onConfirm={() => {
          setDeclining(false);
          onDecline();
        }}
      />

      <div className="relative hidden min-h-48 bg-muted sm:block">
        <LayoutMap track={event.track} alt={event.roundName} className="p-6" iconClassName="size-8" />
      </div>
    </section>
  );
};

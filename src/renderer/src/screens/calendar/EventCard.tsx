import { ArrowRightIcon, LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FADED_WELL } from './constants.ts';
import type { CalendarEntry } from '../../../../shared/types';
import { HistoricChip } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import {
  CAUTION_ACCENT, DISCIPLINE_ACCENT, DISCIPLINE_WELL, EVENT_ACCENT, INVITATION_ACCENT,
} from '@/lib/accents';
import { editionName } from '@/lib/edition-names';
import { raceLength } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';
import { raceLabels, tierAccent } from '@/screens/championships';
import { LayoutMap } from '@/screens/track-browser';

interface EventCardProps {
  /**
   * The event this card stands for.
   */
  event: CalendarEntry;
  /**
   * Called to open the round's event page, which is where it is entered and
   * raced.
   */
  onOpen: () => void;
}

export const EventCard = ({ event, onOpen }: EventCardProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatMoney, formatNumber } = useFormat();
  // Where a historic event's invitation stands, which its chip says - an
  // event entered at the player's own cost says Entered as any round does.
  const state = event.invitation?.state;
  const invitation = event.invitation && state && state !== 'entered' ? { ...event.invitation, state } : null;
  const answering = state === 'awaiting';

  const labels = raceLabels(event.races.map((race) => race.name), t('calendar.raceFallback'));
  const lengths = event.races.map((race, at) => {
    const length = raceLength(race, t, formatNumber);

    return event.races.length > 1
      ? t('championships.format.session', { name: labels[at], length })
      : length;
  });

  // A historic event is one day: behind the clock, there is nothing left of it
  // to enter.
  const open = !event.enrolled && event.eligible && event.raceable
    && (!event.historic || event.status === 'scheduled');
  const yours = event.enrolled && event.status === 'scheduled';

  return (
    // The whole card opens the event page; the corner only says what it offers.
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'relative flex w-full flex-col gap-2 rounded-lg border bg-card px-3 py-2.5 text-left',
        'hover-outline',
        // A ring rather than a fill for an event you are in, so it stays legible.
        event.enrolled ? 'border-primary/60 ring-1 ring-primary/60' : '',
        // An invitation still to be answered, dashed in the leather until it is.
        answering ? 'border-dashed border-historic-foreground/60' : '',
        // A rung not reached yet is shown, just without a card's full weight.
        event.eligible ? '' : 'border-dashed bg-transparent',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* A historic event has no round number; its chip stands there. */}
            {event.historic ? <HistoricChip className="px-1.5 py-0 text-[0.65rem]" /> : (
              <span className="font-mono text-[0.65rem] text-muted-foreground">
                {t('calendar.round', { number: event.number })}
              </span>
            )}
            <Badge className={cn('px-1.5 py-0 text-[0.65rem]', DISCIPLINE_ACCENT[event.ladder.discipline])}>
              {event.entryName}
            </Badge>
            <Badge className={cn('px-1.5 py-0 text-[0.65rem]', tierAccent(event.ladder.tier))}>
              {t('championships.tier', { tier: event.ladder.tier })}
            </Badge>
            {/* Neutral on purpose: sharing a calendar with another class is a
                footnote about the grid, not one of a set worth a colour. */}
            {event.multiClass ? (
              <Badge variant="outline" className="px-1.5 py-0 text-[0.65rem]">
                {t('calendar.multiClass')}
              </Badge>
            ) : null}
          </div>

          <h3 className={cn('flex items-center gap-1.5 text-sm', event.eligible ? 'font-semibold' : 'font-medium')}>
            <span className="truncate">{event.seriesName}</span>
            {/* Neutral on purpose: an edition's name is an identifier, not one of
                a set - and named only where the championship runs more than once
                a year, since a year-long one's is the year the calendar shows. */}
            {event.editions > 1 ? (
              <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[0.65rem]">
                {editionName({
                  year: Number(event.date.slice(0, 4)), edition: event.edition, editions: event.editions,
                }, t)}
              </Badge>
            ) : null}
          </h3>

          <p className="truncate text-xs text-muted-foreground">
            {/* A historic event's one round is named after the event, which
                the title already says. */}
            {[...(event.historic ? [] : [event.roundName]), ...lengths, t('calendar.grid', { count: event.gridSize })]
              .join(' · ')}
          </p>
        </div>

        <div
          className={cn(
            'relative aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-md',
            (event.eligible ? DISCIPLINE_WELL : FADED_WELL)[event.ladder.discipline],
          )}
        >
          <LayoutMap track={event.track} alt={event.roundName} className="p-1" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t pt-2">
        {event.prize === null ? null : (
          <>
            <span className="text-sm font-semibold tabular-nums">{formatMoney(event.prize)}</span>
            <span className="text-xs text-muted-foreground">{t('calendar.toWinner')}</span>
          </>
        )}

        {/* Only on an event the career is in: an un-entered round behind the
            clock was not missed. */}
        {event.enrolled && event.status !== 'scheduled' ? (
          <Badge className={cn('px-1.5 py-0 text-[0.65rem]', EVENT_ACCENT[event.status])}>
            {t(`calendar.status.${event.status}`)}
          </Badge>
        ) : null}
        {invitation && (event.status === 'scheduled' || invitation.state === 'accepted') ? (
          <Badge className={cn('px-1.5 py-0 text-[0.65rem]', INVITATION_ACCENT[invitation.state])}>
            {t(`invitation.state.${invitation.state}`, {
              day: formatDayShort(invitation.state === 'pending' ? invitation.invitations : event.date),
            })}
          </Badge>
        ) : null}
        {/* What anyone pays to enter a historic event they hold no invitation
            to, beside where that invitation stands. Neutral on purpose: an
            amount, as the prize beside it is. */}
        {open && event.historic && !answering && event.entryFee ? (
          <span className="text-xs text-muted-foreground">
            {t('calendar.feeToEnter', { amount: formatMoney(event.entryFee) })}
          </span>
        ) : null}
        {/* Neutral on purpose: the card's ring already carries primary for a
            event you are in, and primary is kept off chips so the two cannot
            be confused. An invitation accepted says so in its own chip. */}
        {yours && !event.clash && !invitation ? (
          <Badge variant="outline" className="px-1.5 py-0 text-[0.65rem]">
            {t('calendar.enrolled')}
          </Badge>
        ) : null}
        {event.clash ? (
          <Badge className={cn('px-1.5 py-0 text-[0.65rem]', CAUTION_ACCENT)} title={t('calendar.clashHint')}>
            {t('calendar.clash')}
          </Badge>
        ) : null}
        {/* Neutral on purpose: most of a calendar is above the player's level -
            772 of 981 events in a first season - so amber here would be on
            nearly every card and drown the clash beside it, which is the amber
            worth noticing. The round page's enter panel, where it blocks the
            Enter button, does colour it. */}
        {event.eligible ? null : (
          <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[0.65rem] text-muted-foreground">
            <LockIcon className="size-2.5" />
            {t('calendar.locked')}
          </Badge>
        )}
        {event.eligible && !event.raceable ? (
          <Badge variant="destructive" className="px-1.5 py-0 text-[0.65rem]">
            {t('calendar.unraceable')}
          </Badge>
        ) : null}

        {open || yours ? (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-primary">
            {t(answering ? 'calendar.answer' : (open && 'calendar.enter') || 'calendar.open')}
            <ArrowRightIcon className="size-3" />
          </span>
        ) : null}
      </div>
    </button>
  );
};

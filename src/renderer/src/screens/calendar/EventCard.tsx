import { MapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CalendarEntry } from '../../../../shared/types';
import { ContentImage } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT, EVENT_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { raceLabels, tierAccent } from '@/screens/championships';
import { layoutMapSources } from '@/screens/track-browser';

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
  const { formatMoney, formatNumber } = useFormat();

  // The same wording a championship's own round row uses, so one round does
  // not read two ways depending on which screen is showing it.
  const labels = raceLabels(event.races.map((race) => race.name), t('calendar.raceFallback'));
  const lengths = event.races.map((race, at) => {
    const laps = t('championships.format.laps', { count: race.laps ?? 0 });
    const length = race.distance === undefined
      ? laps
      : t('championships.calendar.raceDistance', {
        distance: t('championships.format.distance', { value: formatNumber(race.distance) }),
        laps,
      });

    return event.races.length > 1
      ? t('championships.format.session', { name: labels[at], length })
      : length;
  });

  return (
    // The whole card is the way in: entering a championship and running its
    // sessions both happen on the event page, so there is nothing to do here
    // that is not "open it".
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'relative flex w-full flex-col gap-2 overflow-hidden rounded-md border bg-card p-3 text-left',
        'transition-colors hover:bg-accent/40',
        // The one thing that has to read across a wall of cards: a weekend you
        // are in. A left edge rather than a fill, so the card stays legible.
        event.enrolled ? 'border-l-4 border-l-primary' : '',
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[0.65rem] text-muted-foreground">
              {t('calendar.round', { number: event.number })}
            </span>
            <Badge className={cn('px-1.5 py-0 text-[0.65rem]', DISCIPLINE_ACCENT[event.ladder.discipline])}>
              {event.entryName}
            </Badge>
            <Badge className={cn('px-1.5 py-0 text-[0.65rem]', tierAccent(event.ladder.tier))}>
              {t('championships.tier', { tier: event.ladder.tier })}
            </Badge>
            {event.multiClass ? (
              <Badge variant="outline" className="px-1.5 py-0 text-[0.65rem]">
                {t('calendar.multiClass')}
              </Badge>
            ) : null}
          </div>

          <h3 className="truncate text-sm font-semibold">{event.seriesName}</h3>

          <p className="truncate text-xs text-muted-foreground">
            {[event.roundName, ...lengths, t('calendar.grid', { count: event.gridSize })].join(' · ')}
          </p>
        </div>

        {/* The layout's shape rather than its photo, as the round rows show it:
            one layout of a circuit photographs like any other, and which one is
            being raced is what the card has to say. */}
        <div className="relative aspect-[16/9] w-20 shrink-0 overflow-hidden rounded-sm bg-muted">
          <ContentImage
            sources={layoutMapSources({ id: event.track.id, layout: event.track.layout ?? '' })}
            alt={event.roundName}
            className="object-contain p-1 [&[src*='/outline']]:invert dark:[&[src*='/outline']]:invert-0"
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center">
                <MapIcon className="size-4 text-muted-foreground/40" />
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {event.prize === null ? null : (
          <Badge variant="outline" className="px-1.5 py-0 font-mono text-[0.65rem]">
            {t('calendar.prize', { amount: formatMoney(event.prize) })}
          </Badge>
        )}
        {event.enrolled ? (
          <Badge variant="outline" className="px-1.5 py-0 text-[0.65rem]">
            {t('calendar.enrolled')}
          </Badge>
        ) : null}
        {/* Only on a weekend the career is in. Every championship is dated, so
            an un-entered one has rounds behind the clock too - and they were
            not missed, since missing something means having entered it. */}
        {event.enrolled && event.status !== 'scheduled' ? (
          <Badge className={cn('px-1.5 py-0 text-[0.65rem]', EVENT_ACCENT[event.status])}>
            {t(`calendar.status.${event.status}`)}
          </Badge>
        ) : null}
        {event.clash ? (
          <Badge
            className="border-transparent bg-warning px-1.5 py-0 text-[0.65rem] text-warning-foreground"
            title={t('calendar.clashHint')}
          >
            {t('calendar.clash')}
          </Badge>
        ) : null}
        {event.eligible ? null : (
          <Badge variant="outline" className="px-1.5 py-0 text-[0.65rem] text-muted-foreground">
            {t('calendar.locked')}
          </Badge>
        )}
        {event.eligible && !event.raceable ? (
          <Badge variant="destructive" className="px-1.5 py-0 text-[0.65rem]">
            {t('calendar.unraceable')}
          </Badge>
        ) : null}
      </div>
    </button>
  );
};

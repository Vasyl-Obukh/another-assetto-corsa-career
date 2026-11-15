import { useTranslation } from 'react-i18next';

import type { Round, SeriesListing } from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { roundRaceableIn } from '../../../../shared/utils/round-availability';
import { Shimmer } from '@/components';
import { useFormat } from '@/i18n';
import { FormatStrip, RoundRaces, trackLabelOf } from '@/screens/championships';
import { LayoutMap } from '@/screens/track-browser';

interface CalendarRowProps {
  /**
   * The championship.
   */
  listing: SeriesListing;
  /**
   * The round.
   */
  round: Round;
  /**
   * Its place in the calendar, counting from one.
   */
  number: number;
  /**
   * Its race day, as an ISO date - undefined while it is worked out, and null
   * when it could not be.
   */
  date: string | null | undefined;
  /**
   * The class the player races in, whose races are the ones measured.
   */
  entry: string;
  /**
   * What the player is called, which RoundRaces wants for a winner it never
   * has here.
   */
  playerName: string;
}

/**
 * One round of the season about to be raced: its number, its layout, its
 * sessions, its day and how long its races run.
 */
export const CalendarRow = ({
  listing, round, number, date, entry, playerName,
}: CalendarRowProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const format = formatOf(listing.series, round);
  const raceable = roundRaceableIn(listing.availability, round.id);

  return (
    <li className="grid grid-cols-[1.75rem_4rem_minmax(0,1fr)_auto] items-center gap-3 border-t px-4 py-2.5 first:border-t-0">
      <span className="text-sm font-semibold tabular-nums">{number}</span>
      <span className="relative aspect-[16/10] w-16 overflow-hidden rounded-md bg-muted">
        <LayoutMap track={round.track} alt={round.name} className="p-1" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm font-semibold">{round.name}</span>
        <span className="truncate text-xs text-muted-foreground">{trackLabelOf(round, t)}</span>
        {format ? <FormatStrip sessions={format.sessions} /> : null}
        {raceable ? null : <span className="text-xs text-warning-foreground dark:text-warning">{t('newChampionship.unraceable')}</span>}
      </span>
      <span className="flex flex-col items-end gap-1 text-right text-xs">
        {date ? <span className="font-medium whitespace-nowrap">{formatDayShort(date)}</span> : null}
        {date === undefined ? <Shimmer className="h-3.5 w-14" /> : null}
        <RoundRaces
          listing={listing}
          round={round}
          entry={entry}
          playerName={playerName}
          number={number}
        />
      </span>
    </li>
  );
};

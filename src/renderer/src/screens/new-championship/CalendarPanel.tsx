import { CalendarDaysIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CalendarRow } from './CalendarRow.tsx';
import type { ChampionshipPreview, SeriesListing } from '../../../../shared/types';
import { useFormat } from '@/i18n';
import { SECTION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface CalendarPanelProps {
  /**
   * The championship picked.
   */
  listing: SeriesListing;
  /**
   * Its rounds dated in the year asked for, undefined while they are read,
   * or null when they could not be.
   */
  preview: ChampionshipPreview | null | undefined;
  /**
   * The class the player races in, whose races the rows show the length of.
   */
  entry: string;
  /**
   * The year it would be raced in.
   */
  year: number;
  /**
   * What the player is called.
   */
  playerName: string;
}

/**
 * The season about to be raced, a round a row, each on the day it would fall
 * in the year asked for.
 */
export const CalendarPanel = ({
  listing, preview, entry, year, playerName,
}: CalendarPanelProps) => {
  const { t } = useTranslation();
  const { formatYear } = useFormat();
  const { rounds } = listing.series;

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <h3 className="flex items-center gap-2.5 px-4 pt-4 pb-3 text-sm font-semibold">
        <span className={cn('grid size-7 place-items-center rounded-md [&_svg]:size-4', SECTION_ACCENT.calendar)}>
          <CalendarDaysIcon />
        </span>
        {t('newChampionship.calendar')}
        <span className="font-normal text-muted-foreground">
          {t('newChampionship.calendarYear', {
            rounds: t('newChampionship.rounds', { count: rounds.length }),
            year: formatYear(year),
          })}
        </span>
      </h3>
      <ol className="border-t">
        {rounds.map((round, at) => (
          <CalendarRow
            key={round.id}
            listing={listing}
            round={round}
            number={at + 1}
            date={preview === undefined
              ? undefined
              : preview?.events.find((one) => one.round === round.id)?.date ?? null}
            entry={entry}
            playerName={playerName}
          />
        ))}
      </ol>
    </section>
  );
};

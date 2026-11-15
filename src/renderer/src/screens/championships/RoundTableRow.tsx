import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { FormatStrip } from './FormatStrip.tsx';
import { RoundRaces } from './RoundRaces.tsx';
import { trackLabelOf } from './utils.ts';
import type { Round, SeasonEvent, SeriesListing } from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { seatRaceableIn } from '../../../../shared/utils/round-availability';
import { ClimateBadge, ResultCell } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { EVENT_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import type { RoundColumn } from '@/lib/season-results';
import { placeIn } from '@/lib/season-results';
import { cn } from '@/lib/utils.ts';
import { LayoutMap } from '@/screens/track-browser';

interface RoundTableRowProps {
  /**
   * The championship and its availability.
   */
  listing: SeriesListing;
  /**
   * The round the row describes.
   */
  round: Round;
  /**
   * Its place in the calendar, counting from one.
   */
  number: number;
  /**
   * Whether the table has a career's columns - a date and the player's results.
   */
  career: boolean;
  /**
   * The career's dated event for this round, when it has entered the
   * championship.
   */
  event?: SeasonEvent;
  /**
   * The round as a group of the season's columns, once anything of it has been
   * raced or simulated.
   */
  column?: RoundColumn;
  /**
   * The class whose winners and results the row shows: the player's, or the
   * first of a championship the career is not in.
   */
  entry: string;
  /**
   * The seat the player took, for reading their results off the event.
   */
  playerSeat?: string;
  /**
   * The car the player races, by its folder ID, when the career is in the
   * championship.
   */
  car?: string;
  /**
   * What the player is called.
   */
  playerName: string;
  /**
   * Whether this is the round the page points at next, which lifts the row and
   * fills its Open button.
   */
  next: boolean;
  /**
   * Called to open the round's own page. Left out on a page that races nothing.
   */
  onOpen?: () => void;
}

export const RoundTableRow = ({
  listing, round, number, career, event, column, entry, playerSeat, car, playerName, next, onOpen,
}: RoundTableRowProps) => {
  const { t } = useTranslation();
  const { formatDay, formatMoney, formatNumber } = useFormat();
  const format = formatOf(listing.series, round);
  const isDefault = format?.id === listing.series.defaultEventFormat;
  const underway = listing.event?.round === round.id;

  // Only weather other than the championship's own: a round restating the
  // sidebar's climate would badge every row with the same word.
  const ownClimate = listing.series.generatedWeather && round.climate
    && round.climate !== listing.series.generatedWeather.climate ? round.climate : null;
  // The player's own places, never a substitute's: a round they missed was
  // raced in their seat by someone else.
  const places = (column?.races ?? []).flatMap((race) => {
    const place = playerSeat === undefined ? undefined : placeIn(race.score, entry, playerSeat);

    return place ? [place] : [];
  });
  const earned = places.reduce((sum, place) => sum + place.points, 0);

  return (
    <tr className={cn('border-t first:border-t-0', next && 'bg-primary/5')}>
      <td className="py-2.5 pr-2 pl-4 align-middle font-semibold tabular-nums">{number}</td>

      <td className="py-2.5 pr-3 align-middle">
        <Link
          to={path.track({ id: round.track.id }, round.track.layout)}
          title={t('championships.calendar.openTrack')}
          className="relative block aspect-[16/10] w-16 overflow-hidden rounded-md bg-muted hover-outline"
        >
          <LayoutMap track={round.track} alt={round.name} className="p-1" />
        </Link>
      </td>

      <td className="py-2.5 pr-3 align-middle">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-semibold">{round.name}</span>
          <span className="truncate text-xs text-muted-foreground">{trackLabelOf(round, t)}</span>
          {/* Only what this round says for itself: the championship's own
              climate, fee and conditions are the sidebar's. */}
          {ownClimate || round.conditions
            || round.entryFee !== undefined || underway ? (
              <div className="flex flex-wrap gap-1">
                {ownClimate ? <ClimateBadge climate={ownClimate} /> : null}
                {/* Neutral on purpose: a note and an amount, neither one of a set. */}
                {round.conditions ? (
                  <Badge variant="outline">{t('championships.calendar.ownConditions')}</Badge>
                ) : null}
                {round.entryFee !== undefined ? (
                  <Badge variant="outline">
                    {t('championships.entryFee', { value: formatMoney(round.entryFee) })}
                  </Badge>
                ) : null}
                {/* Also what stops the championship being edited. */}
                {underway ? <Badge variant="warning">{t('championships.calendar.underway')}</Badge> : null}
              </div>
            ) : null}
        </div>
      </td>

      {career ? (
        <td className="py-2.5 pr-3 align-middle whitespace-nowrap text-muted-foreground">
          {event ? formatDay(event.date) : null}
        </td>
      ) : null}

      <td className="py-2.5 pr-3 align-middle">
        {format ? (
          <div className="flex items-center gap-2">
            <FormatStrip sessions={format.sessions} />
            {/* The default's name is said once, in the formats list; a round
                naming its own is one of the calendar's odd ones out. */}
            <span className={cn('text-xs', isDefault ? 'text-muted-foreground' : 'font-medium')}>
              {format.name}
            </span>
          </div>
        ) : null}
      </td>

      <td className="py-2.5 pr-3 align-middle">
        <RoundRaces
          listing={listing}
          round={round}
          column={column}
          entry={entry}
          playerSeat={playerSeat}
          playerName={playerName}
          number={number}
        />
      </td>

      {career ? (
        <td className="py-2.5 pr-3 align-middle">
          <div className="flex flex-wrap items-center gap-1">
            {places.map((place, index) => (place.bonusOnly ? null : (
              <ResultCell
                // eslint-disable-next-line react/no-array-index-key -- one per race, in the order they ran
                key={index}
                position={place.classPosition}
                scored={place.finishPoints > 0}
                pole={place.qualifyingPosition === 1}
                fastestLap={place.fastestLap}
              />
            )))}
            {places.length > 0 ? (
              <span className="ml-1 text-xs font-semibold text-result-points-foreground tabular-nums">
                {t('standings.bonus.plus', { points: formatNumber(earned) })}
              </span>
            ) : null}
            {/* A missed round has no results to show, so it says why. */}
            {event?.status === 'missed' ? (
              <Badge className={EVENT_ACCENT.missed}>{t('calendar.status.missed')}</Badge>
            ) : null}
            {/* Still to come and out of reach: its page says why, and skips it. */}
            {event?.status === 'scheduled' && car && !seatRaceableIn(listing.availability, round.id, entry, car) ? (
              <Badge variant="warning">{t('championships.calendar.unraceable')}</Badge>
            ) : null}
          </div>
        </td>
      ) : null}

      <td className="py-2.5 pr-4 text-right align-middle">
        {/* Always offered: the round's page is where entering and racing
            happen, and where it says why a round cannot be raced. */}
        {onOpen ? (
          <Button size="sm" variant={next ? 'default' : 'outline'} onClick={onOpen}>
            {t('championships.detail.open')}
            <ArrowRightIcon />
          </Button>
        ) : null}
      </td>
    </tr>
  );
};

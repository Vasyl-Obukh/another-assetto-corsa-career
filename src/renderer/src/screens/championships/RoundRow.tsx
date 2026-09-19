import { MapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  formatOf, raceLabels, roundAvailability, roundRaceable, trackKeyOf,
} from './utils.ts';
import type {
  Round, RoundForecast, RoundRaceLength, SeriesListing,
} from '../../../../shared/types';
import { ClimateBadge, ContentImage, ForecastStrip } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { SESSION_TYPE_LABEL } from '@/screens/race';
import { layoutMapSources } from '@/screens/track-browser';

interface RoundRowProps {
  /**
   * The championship and its availability.
   */
  listing: SeriesListing;
  /**
   * The round this row is for.
   */
  round: Round;
  /**
   * Its position on the calendar, counting from one.
   */
  number: number;
  /**
   * Whether a round is already being set up.
   */
  busy: boolean;
  /**
   * The round's weather forecast, or null when the championship's weather is
   * authored rather than generated.
   */
  forecast: RoundForecast | null;
  /**
   * Called when this round should be set up as the race being prepared. Left
   * out on a page no round is raced from, which then offers no button.
   */
  onRace?: () => void;
}

export const RoundRow = ({
  listing, round, number, busy, forecast, onRace,
}: RoundRowProps) => {
  const { t } = useTranslation();
  const { formatMoney, formatNumber } = useFormat();
  const state = roundAvailability(listing, round.id);
  const raceable = roundRaceable(listing, round.id);
  // Only when the round runs something other than the default: badging every
  // row with the same word says nothing, and what a calendar has to show is
  // which of its weekends are the odd ones.
  const format = round.weekendFormat === undefined ? null : formatOf(listing.series, round);
  const underway = listing.weekend?.round === round.id;
  const names = raceLabels(
    state?.races.map((race) => race.name) ?? [],
    t(SESSION_TYPE_LABEL.race),
  );

  /**
   * Names one race's length, with the race's name when there is more than one.
   *
   * A race stated as a distance says both, since the distance is what the
   * championship races and the lap count is what this round comes to on this
   * track - the two differ round by round off each layout's length.
   * @param name The race's name
   * @param race The race's length, as the round resolves it
   * @param named Whether the round runs several races
   * @returns The badge's text
   */
  const raceLabel = (name: string, race: RoundRaceLength, named: boolean): string => {
    const laps = t('championships.format.laps', { count: race.laps ?? 0 });
    const length = race.distance === undefined
      ? laps
      : t('championships.calendar.raceDistance', {
        distance: t('championships.format.distance', { value: formatNumber(race.distance) }),
        laps,
      });

    return named ? t('championships.format.session', { name, length }) : length;
  };

  return (
    // The number and the layout are centred on the whole row, forecast
    // included, so everything else goes in a column of its own beside them.
    <div className="flex items-center gap-3 border-b py-3 last:border-b-0">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {t('championships.calendar.round', { number })}
      </span>

      {/* The layout's shape rather than its photo, as the race screen shows
          it: the photo of one layout of a circuit is the same pit straight as
          any other, and which layout a round runs is what the row has to say.
          Inverted the other way round from the larger maps: the outline is a
          white ribbon edged in black, and at this size only the ribbon reads,
          so it stays white on the dark theme and turns black on the light. */}
      <div className="relative aspect-[16/9] w-24 shrink-0 overflow-hidden rounded-md bg-muted">
        <ContentImage
          sources={layoutMapSources({ id: round.track.id, layout: round.track.layout ?? '' })}
          alt={round.name}
          className="object-contain p-1 [&[src*='/outline']]:invert dark:[&[src*='/outline']]:invert-0"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center">
              <MapIcon className="size-5 text-muted-foreground/40" />
            </div>
          )}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{round.name}</span>
            <span className="truncate text-xs text-muted-foreground">{trackKeyOf(round)}</span>
          </div>

          {format ? (
            <Badge variant="secondary">{format.name}</Badge>
      ) : null}

          {/* Only a round expecting other weather than the championship's own. */}
          {listing.series.generatedWeather && round.climate ? (
            <ClimateBadge climate={round.climate} />
      ) : null}

          {/* Only what this round says for itself. A calendar's job is to show
          which of its rows are the odd ones, so the championship's own fee and
          conditions are left to the cards that own them. */}
          {round.conditions ? (
            <Badge variant="outline">{t('championships.calendar.ownConditions')}</Badge>
      ) : null}

          {round.entryFee !== undefined ? (
            <Badge variant="outline">
              {t('championships.entryFee', { value: formatMoney(round.entryFee) })}
            </Badge>
      ) : null}

          {/* Also what stops the championship being edited. */}
          {underway ? (
            <Badge variant="warning">
              {t('championships.calendar.underway')}
            </Badge>
      ) : null}

          {/* How long each race runs here: a distance is only laps on a track,
              so this is where a round says what its race comes to. A count,
              so neutral; one the track cannot answer is a problem. */}
          {state?.track ? null : state?.races.map((race, index) => (
            <Badge
              // eslint-disable-next-line react/no-array-index-key -- a race is known only by its place in the weekend
              key={index}
              variant={race.laps === null ? 'destructive' : 'outline'}
            >
              {race.laps === null
                ? t('championships.calendar.lapUnknown', { name: names[index] })
                : raceLabel(names[index], race, state.races.length > 1)}
            </Badge>
          ))}

          {state?.track ? (
            <Badge variant="destructive">{t('championships.calendar.missingTrack')}</Badge>
      ) : null}

          {state?.pitboxes ? (
            <Badge variant="destructive">
              {t('championships.calendar.tooFewPitboxes', {
            available: state.pitboxes.available,
            needed: state.pitboxes.needed,
          })}
            </Badge>
      ) : null}

          {onRace ? (
            <Button size="sm" variant="outline" disabled={!raceable || busy} onClick={onRace}>
              {t('championships.calendar.race')}
            </Button>
          ) : null}

        </div>

        {/* A line of its own under the name, so a weekend of eight sessions
          never squeezes the row. */}
        {forecast ? <ForecastStrip forecast={forecast} /> : null}
      </div>
    </div>
  );
};

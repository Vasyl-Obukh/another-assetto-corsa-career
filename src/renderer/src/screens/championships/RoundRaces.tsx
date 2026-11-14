import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { raceLabels } from './utils.ts';
import type { Round, SeriesListing } from '../../../../shared/types';
import { roundAvailability } from '../../../../shared/utils/round-availability';
import { NationFlag } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useUnits } from '@/hooks';
import type { RoundColumn } from '@/lib/season-results';
import { seatNation } from '@/lib/season-results';
import { raceLength, SESSION_TYPE_LABEL } from '@/lib/session-labels';

interface RoundRacesProps {
  /**
   * The championship and its availability.
   */
  listing: SeriesListing;
  /**
   * The round.
   */
  round: Round;
  /**
   * The round as a group of the season's columns, once anything of it has been
   * raced or simulated.
   */
  column?: RoundColumn;
  /**
   * The class whose winners the cell names.
   */
  entry: string;
  /**
   * The seat the player took, which wins under the player's own name.
   */
  playerSeat?: string;
  /**
   * What the player is called.
   */
  playerName: string;
}

// A round run names who won each race; one still to come, how long its races
// are - or what stops it being raced at all.
export const RoundRaces = ({
  listing, round, column, entry, playerSeat, playerName,
}: RoundRacesProps) => {
  const { t } = useTranslation();
  const units = useUnits();
  const state = roundAvailability(listing, round.id);
  const names = raceLabels(state?.races.map((race) => race.name) ?? [], t(SESSION_TYPE_LABEL.race));

  const lengths = state?.races.map((race) => raceLength(race, t, units)) ?? [];
  // An event of identical races says so once rather than repeating itself.
  const same = lengths.length > 1 && lengths.every((length) => length === lengths[0]);
  const winners = column?.scored ? column.races.flatMap((race) => {
    const won = race.score?.places.find((place) => place.entry === entry && place.classPosition === 1);

    return won ? [{ race, won }] : [];
  }) : [];

  return (
    <div className="flex flex-col items-start gap-1 text-sm tabular-nums">
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
      {winners.map(({ race, won }, at) => (
        <span key={race.launch} className="flex items-center gap-1.5 text-xs whitespace-nowrap">
          <TrophyIcon className="size-3 text-podium-gold-foreground" />
          {winners.length > 1 ? (
            <span className="text-muted-foreground">{t('standings.raceShort', { number: at + 1 })}</span>
          ) : null}
          <NationFlag code={seatNation(listing.series, won.seat)} className="h-2.5 w-3.5" />
          <span className="font-medium">
            {won.seat === playerSeat && !won.substitute ? playerName : won.driver}
          </span>
        </span>
      ))}
      {state?.track || winners.length > 0 ? null : state?.races.map((race, index) => {
        if (race.laps === null) {
          return (
            // eslint-disable-next-line react/no-array-index-key -- a race is known only by its place in the event
            <Badge key={index} variant="destructive">
              {t('championships.calendar.lapUnknown', { name: names[index] })}
            </Badge>
          );
        }
        if (same && index > 0) return null;
        const length = same
          ? t('championships.detail.raceTimes', { count: lengths.length, length: lengths[0] })
          : lengths[index];

        return (
          // eslint-disable-next-line react/no-array-index-key -- a race is known only by its place in the event
          <span key={index} className="whitespace-nowrap">
            {lengths.length > 1 && !same
              ? t('championships.format.session', { name: names[index], length })
              : length}
          </span>
        );
      })}
    </div>
  );
};

import { useTranslation } from 'react-i18next';

import {
  formatOf, roundAvailability, roundRaceable, trackKeyOf,
} from './utils.ts';
import type { Round, RoundForecast, SeriesListing } from '../../../../shared/types';
import { ClimateBadge, ForecastStrip } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';

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
   * Called when this round should be set up as the race being prepared.
   */
  onRace: () => void;
}

export const RoundRow = ({
  listing, round, number, busy, forecast, onRace,
}: RoundRowProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const state = roundAvailability(listing, round.id);
  const raceable = roundRaceable(listing, round.id);
  // Only when the round runs something other than the default: badging every
  // row with the same word says nothing, and what a calendar has to show is
  // which of its weekends are the odd ones.
  const format = round.weekendFormat === undefined ? null : formatOf(listing.series, round);
  const underway = listing.weekend?.round === round.id;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b py-3 last:border-b-0">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {t('championships.calendar.round', { number })}
      </span>

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

      <Button size="sm" variant="outline" disabled={!raceable || busy} onClick={onRace}>
        {t('championships.calendar.race')}
      </Button>

      {/* A line of its own, lined up under the name rather than the round
          number, so a weekend of eight sessions never squeezes the row. */}
      {forecast ? (
        <div className="flex basis-full gap-3">
          <span className="w-20 shrink-0" aria-hidden />
          <ForecastStrip forecast={forecast} />
        </div>
      ) : null}
    </div>
  );
};

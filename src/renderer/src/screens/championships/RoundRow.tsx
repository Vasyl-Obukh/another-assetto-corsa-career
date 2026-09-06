import { useTranslation } from 'react-i18next';

import {
  formatOf, roundAvailability, roundRaceable, trackKeyOf,
} from './utils.ts';
import type { Round, SeriesListing } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';

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
   * Called when this round should be set up as the race being prepared.
   */
  onRace: () => void;
}

export const RoundRow = ({
  listing, round, number, busy, onRace,
}: RoundRowProps) => {
  const { t } = useTranslation();
  const state = roundAvailability(listing, round.id);
  const raceable = roundRaceable(listing, round.id);
  // Only when the round runs something other than the default: badging every
  // row with the same word says nothing, and what a calendar has to show is
  // which of its weekends are the odd ones.
  const format = round.weekendFormat === undefined ? null : formatOf(listing.series, round);

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
        <Badge variant="outline">{format.name}</Badge>
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
    </div>
  );
};

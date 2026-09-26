import { ChevronRightIcon, TrophyIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { CareerEventView, ChampionshipResults } from '../../../../shared/types';
import {
  DriverName, Movement, ResultCell, ResultStrip, StandingsTable,
} from '@/components';
import type { StripFigure } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { placeIn, seasonResults, seatNation } from '@/lib/season-results';

interface RoundSummaryProps {
  /**
   * The round.
   */
  view: CareerEventView;
  /**
   * The championship's season so far.
   */
  results: ChampionshipResults;
  /**
   * What the player is called.
   */
  playerName: string;
  /**
   * Called to open the championship's full standings.
   */
  onFull: () => void;
}

/**
 * How many finishers each race's card lists.
 */
const PODIUM = 3;

/**
 * A round once it has been raced: what the player took from it, who won each
 * race, and where it left the championship.
 */
export const RoundSummary = ({
  view, results, playerName, onFull,
}: RoundSummaryProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const season = useMemo(() => seasonResults(results, view.round), [results, view.round]);
  const column = season.rounds.find((one) => one.round.id === view.round);
  const entry = results.playerEntry ?? results.championship.entries[0]?.id ?? '';
  const table = season.classes.find((one) => one.entry === entry);
  const player = table?.drivers.find((row) => row.player);
  const races = column?.races.filter((race) => race.score !== null) ?? [];
  const mine = player ? races.map((race) => placeIn(race.score, entry, player.key)) : [];
  const earned = mine.reduce((sum, place) => sum + (place?.points ?? 0), 0);

  const figures: StripFigure[] = player && mine.some((place) => place) ? [
    {
      label: t('event.summary.races'),
      value: (
        <span className="flex gap-1">
          {mine.map((place, at) => (place && !place.bonusOnly ? (
            <ResultCell
              // eslint-disable-next-line react/no-array-index-key -- one per race, in the order they ran
              key={at}
              size="lg"
              position={place.classPosition}
              scored={place.finishPoints > 0}
              pole={place.qualifyingPosition === 1}
              fastestLap={place.fastestLap}
            />
          ) : null))}
        </span>
      ),
    },
    {
      label: t('event.summary.points'),
      value: (
        <span className="text-result-points-foreground">
          {t('standings.bonus.plus', { points: formatNumber(earned) })}
        </span>
      ),
    },
    {
      label: t('event.summary.championship'),
      value: (
        <>
          <ResultCell position={player.position} scored={player.points > 0} prefixed size="lg" />
          <Movement move={player.move} />
        </>
      ),
      detail: t('event.summary.total', { count: player.points }),
    },
  ] : [];

  return (
    <div className="flex flex-col gap-4">
      {figures.length > 0 ? <ResultStrip figures={figures} /> : null}

      {races.length > 0 ? (
        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <TrophyIcon className="size-4 text-podium-gold-foreground" />
            {t('event.summary.winners')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {races.map((race, at) => {
              const top = (race.score?.places ?? [])
                .filter((place) => place.entry === entry && !place.bonusOnly && place.classPosition <= PODIUM)
                .sort((left, right) => left.classPosition - right.classPosition);
              const own = mine[at];

              return (
                <div key={race.launch} className="flex flex-col gap-2 rounded-lg border p-3">
                  <span className="flex items-center gap-2">
                    <Badge className={SESSION_ACCENT.race}>
                      {race.name ?? t('standings.raceShort', { number: at + 1 })}
                    </Badge>
                    {own && !own.bonusOnly ? (
                      <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                        {t('standings.you')}
                        <ResultCell
                          size="sm"
                          position={own.classPosition}
                          scored={own.finishPoints > 0}
                          pole={own.qualifyingPosition === 1}
                          fastestLap={own.fastestLap}
                        />
                      </span>
                    ) : null}
                  </span>
                  {top.map((place) => {
                    const you = place.seat === results.playerSeat && !place.substitute;

                    return (
                      <span key={place.seat + String(place.substitute)} className="flex items-center gap-2 text-sm">
                        <ResultCell size="sm" position={place.classPosition} scored />
                        <DriverName
                          name={you ? playerName : place.driver}
                          nation={seatNation(results.championship, place.seat)}
                          player={you}
                        />
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {table && season.counted > 0 ? (
        <section className="flex flex-col rounded-xl border">
          <div className="flex items-center justify-between gap-2 px-4 pt-3">
            <h3 className="text-sm font-semibold">
              {t('standings.afterRound', { number: column?.number ?? 0 })}
            </h3>
            <Button size="sm" variant="outline" onClick={onFull}>
              {t('standings.fullStandings')}
              <ChevronRightIcon />
            </Button>
          </div>
          <div className="px-1 pt-2 pb-1">
            <StandingsTable season={table} series={results.championship} playerName={playerName} compact />
          </div>
        </section>
      ) : null}
    </div>
  );
};
